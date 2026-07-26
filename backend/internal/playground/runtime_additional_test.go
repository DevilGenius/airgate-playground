package playground

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"

	sdk "github.com/DevilGenius/airgate-sdk/sdkgo"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type playgroundFakeHost struct {
	responses map[string]*sdk.HostInvokeResponse
	errors    map[string]error
	stream    sdk.HostStream
	streamErr error
	calls     []sdk.HostInvokeRequest
	streams   []sdk.HostStreamRequest
}

func (h *playgroundFakeHost) Invoke(_ context.Context, req sdk.HostInvokeRequest) (*sdk.HostInvokeResponse, error) {
	h.calls = append(h.calls, req)
	if err := h.errors[req.Method]; err != nil {
		return nil, err
	}
	return h.responses[req.Method], nil
}

func (h *playgroundFakeHost) InvokeStream(_ context.Context, req sdk.HostStreamRequest) (sdk.HostStream, error) {
	h.streams = append(h.streams, req)
	if h.streamErr != nil {
		return nil, h.streamErr
	}
	return h.stream, nil
}

type playgroundFakeStream struct {
	frames []*sdk.HostStreamFrame
	err    error
	closed bool
}

func (s *playgroundFakeStream) Send(sdk.HostStreamFrame) error { return nil }

func (s *playgroundFakeStream) Recv() (*sdk.HostStreamFrame, error) {
	if len(s.frames) == 0 {
		if s.err != nil {
			err := s.err
			s.err = nil
			return nil, err
		}
		return nil, io.EOF
	}
	frame := s.frames[0]
	s.frames = s.frames[1:]
	return frame, nil
}

func (s *playgroundFakeStream) CloseSend() error {
	s.closed = true
	return nil
}

type playgroundFakeContext struct {
	logger *slog.Logger
	host   sdk.Host
	cfg    sdk.PluginConfig
}

func (c playgroundFakeContext) Logger() *slog.Logger {
	if c.logger != nil {
		return c.logger
	}
	return slog.Default()
}
func (c playgroundFakeContext) Config() sdk.PluginConfig { return c.cfg }
func (c playgroundFakeContext) Host() sdk.Host           { return c.host }

type stringerValue string

func (s stringerValue) String() string { return string(s) }

func TestHostInvokeAndPayloadHelpersAdditional(t *testing.T) {
	if _, err := hostInvoke(context.Background(), nil, "x", nil); err == nil {
		t.Fatalf("nil host should fail")
	}

	host := &playgroundFakeHost{
		responses: map[string]*sdk.HostInvokeResponse{
			"nil":       nil,
			"ok":        {Status: "ok", Payload: map[string]interface{}{"value": 1}},
			"bad":       {Status: "error", Payload: map[string]interface{}{"message": "boom"}},
			"bad-empty": {Status: "error", Payload: map[string]interface{}{}},
		},
		errors: map[string]error{"transport": errors.New("transport failed")},
	}
	if resp, err := hostInvoke(context.Background(), host, "nil", nil); err != nil || len(resp) != 0 {
		t.Fatalf("nil response = %#v, %v", resp, err)
	}
	if resp, err := hostInvoke(context.Background(), host, "ok", nil); err != nil || resp["value"] != 1 {
		t.Fatalf("ok response = %#v, %v", resp, err)
	}
	if _, err := hostInvoke(context.Background(), host, "bad", nil); err == nil {
		t.Fatalf("error response should fail")
	}
	if _, err := hostInvoke(context.Background(), host, "bad-empty", nil); err == nil {
		t.Fatalf("error response without message should fail")
	}
	if _, err := hostInvoke(context.Background(), host, "transport", nil); err == nil {
		t.Fatalf("transport error should fail")
	}

	headers := http.Header{}
	headers.Add("X-Test", "a")
	headers.Add("X-Test", "b")
	payload := hostForwardPayload(hostForwardRequest{
		UserID: 1, GroupID: 2, Model: "m", Method: http.MethodPost, Path: "/v1/chat/completions", Headers: headers, Body: []byte(`{"ok":true}`), Stream: true,
	})
	if payload["user_id"] != int64(1) || payload["stream"] != true || payload["body"] != `{"ok":true}` {
		t.Fatalf("forward payload = %#v", payload)
	}

	if got := headerFromPayload(map[string]interface{}{"A": []interface{}{"1", "2"}, "B": []string{"3"}, "C": 4}); got.Values("A")[1] != "2" || got.Get("B") != "3" || got.Get("C") != "4" {
		t.Fatalf("headers = %#v", got)
	}
	encoded := base64.StdEncoding.EncodeToString([]byte(`{"ok":true}`))
	if got := string(bytesFromPayload(encoded)); got != `{"ok":true}` {
		t.Fatalf("base64 JSON body = %q", got)
	}
	if got := string(bytesFromPayload("plain")); got != "plain" {
		t.Fatalf("plain body = %q", got)
	}
	if got := string(bytesFromPayload(map[string]interface{}{"x": 1})); !strings.Contains(got, `"x":1`) {
		t.Fatalf("marshaled body = %q", got)
	}
	if !looksLikeJSON([]byte(" [1] ")) || looksLikeJSON([]byte("plain")) {
		t.Fatalf("looksLikeJSON returned unexpected values")
	}
	if usage := usageFromPayload(map[string]interface{}{"model": "m", "input_tokens": 3}); usage == nil || usage.Model != "m" || usage.InputTokens != 3 {
		t.Fatalf("usage = %#v", usage)
	}
	if usage := usageFromPayload(map[string]interface{}{"bad": make(chan int)}); usage != nil {
		t.Fatalf("bad usage = %#v", usage)
	}
	if m, ok := mapFromAny(struct {
		Name string `json:"name"`
	}{Name: "n"}); !ok || m["name"] != "n" {
		t.Fatalf("mapFromAny struct = %#v ok=%v", m, ok)
	}
	if _, ok := mapFromAny(make(chan int)); ok {
		t.Fatalf("mapFromAny channel should fail")
	}
	if stringFromAny(stringerValue("s")) != "s" || stringFromAny(nil) != "" {
		t.Fatalf("stringFromAny returned unexpected values")
	}
	for _, tc := range []struct {
		value any
		want  int64
	}{
		{int(1), 1},
		{int32(2), 2},
		{int64(3), 3},
		{float32(4), 4},
		{float64(5), 5},
		{json.Number("6"), 6},
		{"7", 7},
		{"bad", 0},
	} {
		if got := int64FromAny(tc.value); got != tc.want {
			t.Fatalf("int64FromAny(%T) = %d, want %d", tc.value, got, tc.want)
		}
	}
}

func TestHostForwardAssetAndStreamAdditional(t *testing.T) {
	host := &playgroundFakeHost{responses: map[string]*sdk.HostInvokeResponse{
		hostMethodGatewayForward: {Status: "ok", Payload: map[string]interface{}{
			"status_code": float64(201),
			"headers":     map[string]interface{}{"Content-Type": []interface{}{"application/json"}},
			"body":        base64.StdEncoding.EncodeToString([]byte(`{"ok":true}`)),
			"usage":       map[string]interface{}{"model": "m", "output_tokens": 9},
			"usage_id":    "55",
		}},
		hostMethodUsersGet: {Status: "ok", Payload: map[string]interface{}{"id": 8, "email": "u@example.test"}},
		hostMethodAssetsStore: {Status: "ok", Payload: map[string]interface{}{
			"asset_id":     "asset-1",
			"object_key":   `chat\1\a.png`,
			"public_url":   "https://assets.test/a.png",
			"content_type": "image/png",
			"size_bytes":   json.Number("4"),
		}},
		hostMethodAssetsGetURL:   {Status: "ok", Payload: map[string]interface{}{"url": "https://assets.test/a.png"}},
		hostMethodAssetsGetBytes: {Status: "ok", Payload: map[string]interface{}{"data": "bytes", "content_type": "image/png"}},
		hostMethodAssetsDelete:   {Status: "ok", Payload: map[string]interface{}{"deleted": true}},
	}}

	resp, err := hostForward(context.Background(), host, hostForwardRequest{Model: "m", Method: http.MethodPost, Path: "/x", Headers: http.Header{"A": []string{"b"}}, Body: []byte(`{}`)})
	if err != nil || resp.StatusCode != 201 || resp.Headers.Get("Content-Type") != "application/json" || string(resp.Body) != `{"ok":true}` || resp.Usage.OutputTokens != 9 || resp.UsageID != 55 {
		t.Fatalf("forward = %#v, %v", resp, err)
	}
	info, err := hostGetUserInfo(context.Background(), host, 8)
	if err != nil || info["email"] != "u@example.test" {
		t.Fatalf("user info = %#v, %v", info, err)
	}
	asset, err := hostStoreAsset(context.Background(), host, 1, "chat", "image/png", ".png", []byte("data"))
	if err != nil || asset.ID != "asset-1" || asset.SizeBytes != 4 {
		t.Fatalf("asset = %#v, %v", asset, err)
	}
	if url, err := hostGetAssetURL(context.Background(), host, "chat/1/a.png"); err != nil || url == "" {
		t.Fatalf("asset url = %q, %v", url, err)
	}
	if bytes, err := hostGetAssetBytes(context.Background(), host, "chat/1/a.png"); err != nil || string(bytes.Data) != "bytes" || bytes.ContentType != "image/png" {
		t.Fatalf("asset bytes = %#v, %v", bytes, err)
	}
	if err := hostDeleteAsset(context.Background(), host, "chat/1/a.png"); err != nil {
		t.Fatalf("delete asset: %v", err)
	}

	stream := &playgroundFakeStream{frames: []*sdk.HostStreamFrame{
		{Payload: map[string]interface{}{"status_code": 202, "headers": map[string]interface{}{"X-Stream": "yes"}, "data": "chunk"}},
		{Done: true},
	}}
	host.stream = stream
	var chunks []hostForwardChunk
	if err := hostForwardStream(context.Background(), host, hostForwardRequest{Model: "m"}, func(chunk hostForwardChunk) error {
		chunks = append(chunks, chunk)
		return nil
	}); err != nil {
		t.Fatalf("forward stream: %v", err)
	}
	if !stream.closed || len(chunks) != 2 || chunks[0].StatusCode != 202 || string(chunks[0].Data) != "chunk" {
		t.Fatalf("stream chunks=%#v closed=%v", chunks, stream.closed)
	}
	host.stream = &playgroundFakeStream{frames: []*sdk.HostStreamFrame{{Payload: map[string]interface{}{"data": "chunk"}}}}
	if err := hostForwardStream(context.Background(), host, hostForwardRequest{}, func(hostForwardChunk) error { return errors.New("callback failed") }); err == nil {
		t.Fatalf("callback error should fail")
	}
	host.streamErr = errors.New("stream open failed")
	if err := hostForwardStream(context.Background(), host, hostForwardRequest{}, func(hostForwardChunk) error { return nil }); err == nil {
		t.Fatalf("stream open error should fail")
	}
	if err := hostForwardStream(context.Background(), nil, hostForwardRequest{}, func(hostForwardChunk) error { return nil }); err == nil {
		t.Fatalf("nil host stream should fail")
	}
}

func TestObjectStorageAdditional(t *testing.T) {
	if NewObjectStorage(nil) != nil {
		t.Fatalf("nil host should return nil storage")
	}
	host := &playgroundFakeHost{responses: map[string]*sdk.HostInvokeResponse{
		hostMethodAssetsStore:    {Status: "ok", Payload: map[string]interface{}{"asset_id": "a1", "object_key": `chat\1\a.jpg`, "content_type": "image/jpeg", "size_bytes": 3}},
		hostMethodAssetsGetURL:   {Status: "ok", Payload: map[string]interface{}{"public_url": "https://assets.test/a.jpg"}},
		hostMethodAssetsGetBytes: {Status: "ok", Payload: map[string]interface{}{"data": []byte("abc"), "content_type": "image/jpeg"}},
		hostMethodAssetsDelete:   {Status: "ok", Payload: map[string]interface{}{}},
	}}
	storage := NewObjectStorage(host)
	if assetURI("x") != "airgate-asset://asset/x" {
		t.Fatalf("assetURI mismatch")
	}
	if id, ok := parseAssetURI("airgate-asset://asset/x"); !ok || id != "x" {
		t.Fatalf("parse asset uri id=%q ok=%v", id, ok)
	}
	if _, ok := parseAssetURI("https://asset/x"); ok {
		t.Fatalf("invalid asset uri accepted")
	}
	for _, tc := range []struct {
		contentType string
		want        string
	}{
		{"image/jpeg", ".jpg"},
		{"image/png", ".png"},
		{"image/webp", ".webp"},
		{"image/gif", ".gif"},
		{"text/plain", ".bin"},
	} {
		if got := extensionForContentType(tc.contentType); got != tc.want {
			t.Fatalf("extensionForContentType(%q) = %q", tc.contentType, got)
		}
	}
	dataURL := "data:image/jpeg;base64," + base64.StdEncoding.EncodeToString([]byte("abc"))
	asset, err := storage.StoreImageDataURL(context.Background(), 1, 2, dataURL)
	if err != nil || asset.ID != "a1" || asset.ObjectKey != "chat/1/a.jpg" {
		t.Fatalf("StoreImageDataURL = %#v, %v", asset, err)
	}
	if _, err := storage.StoreImageDataURL(context.Background(), 1, 2, "data:image/png;base64,***"); err == nil {
		t.Fatalf("invalid data url should fail")
	}
	if _, err := storage.StoreImageBase64(context.Background(), 1, 2, "image/png", "***"); err == nil {
		t.Fatalf("invalid base64 should fail")
	}
	if url, err := storage.PublicURL(context.Background(), "chat/1/a.jpg"); err != nil || url == "" {
		t.Fatalf("PublicURL = %q, %v", url, err)
	}
	if bytes, err := storage.GetBytes(context.Background(), "chat/1/a.jpg"); err != nil || string(bytes.Data) != "abc" {
		t.Fatalf("GetBytes = %#v, %v", bytes, err)
	}
	if err := storage.Delete(context.Background(), "chat/1/a.jpg"); err != nil {
		t.Fatalf("Delete: %v", err)
	}

	host.errors = map[string]error{
		hostMethodAssetsStore:    errors.New("store failed"),
		hostMethodAssetsGetURL:   errors.New("url failed"),
		hostMethodAssetsGetBytes: errors.New("bytes failed"),
		hostMethodAssetsDelete:   errors.New("delete failed"),
	}
	if _, err := storage.StoreImageBase64(context.Background(), 1, 2, "image/png", base64.StdEncoding.EncodeToString([]byte("abc"))); err == nil {
		t.Fatalf("StoreImageBase64 should propagate host error")
	}
	if _, err := storage.PublicURL(context.Background(), "chat/1/a.jpg"); err == nil {
		t.Fatalf("PublicURL should propagate host error")
	}
	if _, err := storage.GetBytes(context.Background(), "chat/1/a.jpg"); err == nil {
		t.Fatalf("GetBytes should propagate host error")
	}
	if err := storage.Delete(context.Background(), "chat/1/a.jpg"); err == nil {
		t.Fatalf("Delete should propagate host error")
	}
}

func TestRoutesHelpersAndChatAdditional(t *testing.T) {
	host := &playgroundFakeHost{responses: map[string]*sdk.HostInvokeResponse{
		hostMethodGatewayForward: {Status: "ok", Payload: map[string]interface{}{
			"status_code": 200,
			"headers":     map[string]interface{}{"X-Upstream": "ok"},
			"body":        `{"reply":"ok"}`,
		}},
		hostMethodAssetsGetBytes: {Status: "ok", Payload: map[string]interface{}{"data": []byte("img"), "content_type": ""}},
	}}
	plugin := &Plugin{
		host: host,
		svc: &Service{
			logger:  slog.Default(),
			storage: &ObjectStorage{host: host},
		},
		logger: slog.Default(),
	}

	rec := httptest.NewRecorder()
	plugin.handleChatCompletions(rec, playgroundRequest(http.MethodPost, "/chat/completions", []byte(`{"model":"gpt","stream":false}`), 7, "openai"))
	if rec.Code != http.StatusOK || rec.Header().Get("X-Upstream") != "ok" || !strings.Contains(rec.Body.String(), "reply") {
		t.Fatalf("non-stream chat status=%d headers=%v body=%s", rec.Code, rec.Header(), rec.Body.String())
	}

	stream := &playgroundFakeStream{frames: []*sdk.HostStreamFrame{
		{Payload: map[string]interface{}{"status_code": 200, "headers": map[string]interface{}{"Content-Type": "text/event-stream"}, "data": "data: one\n\n"}},
		{Done: true},
	}}
	host.stream = stream
	rec = httptest.NewRecorder()
	plugin.handleChatCompletions(rec, playgroundRequest(http.MethodPost, "/chat/completions", []byte(`{"model":"gpt"}`), 7, "openai"))
	if rec.Code != http.StatusOK || !strings.Contains(rec.Body.String(), "data: one") {
		t.Fatalf("stream chat status=%d body=%s", rec.Code, rec.Body.String())
	}

	host.stream = &playgroundFakeStream{frames: []*sdk.HostStreamFrame{{Payload: map[string]interface{}{"data": "data: one\n\n"}}}, err: errors.New("late stream")}
	rec = httptest.NewRecorder()
	plugin.handleChatCompletions(rec, playgroundRequest(http.MethodPost, "/chat/completions", []byte(`{"model":"gpt"}`), 7, "openai"))
	if rec.Code != http.StatusOK || !strings.Contains(rec.Body.String(), "upstream_error") {
		t.Fatalf("late stream error status=%d body=%s", rec.Code, rec.Body.String())
	}

	host.streamErr = status.Error(codes.InvalidArgument, "bad request")
	rec = httptest.NewRecorder()
	plugin.handleChatCompletions(rec, playgroundRequest(http.MethodPost, "/chat/completions", []byte(`{"model":"gpt"}`), 7, "openai"))
	if rec.Code != http.StatusBadRequest {
		t.Fatalf("early stream error status=%d body=%s", rec.Code, rec.Body.String())
	}
	host.streamErr = nil

	host.responses[hostMethodUsersGet] = &sdk.HostInvokeResponse{Status: "ok", Payload: map[string]interface{}{"id": 7, "email": "u@example.test"}}
	rec = httptest.NewRecorder()
	plugin.handleGetUserInfo(rec, playgroundRequest(http.MethodGet, "/user/info", nil, 7, ""))
	if rec.Code != http.StatusOK || !strings.Contains(rec.Body.String(), "u@example.test") {
		t.Fatalf("user info status=%d body=%s", rec.Code, rec.Body.String())
	}
	host.errors = map[string]error{hostMethodUsersGet: errors.New("user info failed")}
	rec = httptest.NewRecorder()
	plugin.handleGetUserInfo(rec, playgroundRequest(http.MethodGet, "/user/info", nil, 7, ""))
	if rec.Code != http.StatusInternalServerError {
		t.Fatalf("user info error status=%d body=%s", rec.Code, rec.Body.String())
	}
	host.errors = nil

	for _, tc := range []struct {
		name     string
		request  *http.Request
		wantCode int
	}{
		{"missing platform", playgroundRequest(http.MethodPost, "/chat/completions", []byte(`{"model":"gpt"}`), 7, ""), http.StatusBadRequest},
		{"missing model", playgroundRequest(http.MethodPost, "/chat/completions", []byte(`{"stream":false}`), 7, "openai"), http.StatusBadRequest},
		{"bad asset runtime url", playgroundRequest(http.MethodPost, "/chat/completions", []byte(`{"model":"gpt","messages":[{"content":[{"type":"image_url","image_url":{"url":"/assets-runtime/"}}]}]}`), 7, "openai"), http.StatusBadRequest},
	} {
		t.Run(tc.name, func(t *testing.T) {
			rec := httptest.NewRecorder()
			plugin.handleChatCompletions(rec, tc.request)
			if rec.Code != tc.wantCode {
				t.Fatalf("status = %d body=%s", rec.Code, rec.Body.String())
			}
		})
	}

	body := []byte(`{"model":"gpt","messages":[{"content":[{"type":"image_url","image_url":{"url":"/assets-runtime/chat%2F1%2Fa.png"}}]}]}`)
	rewritten, err := plugin.rewriteChatImageAssetURLs(context.Background(), body)
	if err != nil || !bytes.Contains(rewritten, []byte("data:image/png;base64,")) {
		t.Fatalf("rewrite assets = %s, %v", rewritten, err)
	}
	if key, err := assetObjectKeyFromRuntimeURL("/assets-runtime/chat%2F1%2Fa.png"); err != nil || key != "chat/1/a.png" {
		t.Fatalf("asset key = %q, %v", key, err)
	}
	if _, err := assetObjectKeyFromRuntimeURL("https://example.test/nope"); err == nil {
		t.Fatalf("invalid runtime url should fail")
	}
	if imageContentTypeForObjectKey("x.jpg") != "image/jpeg" || imageContentTypeForObjectKey("x.webp") != "image/webp" || imageContentTypeForObjectKey("x.gif") != "image/gif" || imageContentTypeForObjectKey("x.bin") != "image/png" {
		t.Fatalf("image content type mismatch")
	}
}

func TestHandlerValidationMiddlewareAndMetadataAdditional(t *testing.T) {
	plugin := &Plugin{logger: slog.Default()}

	if got := parsePathID("/prefix/12/", "/prefix/"); got != 12 {
		t.Fatalf("parsePathID = %d", got)
	}
	if got := parsePathID("/other/12", "/prefix/"); got != 0 {
		t.Fatalf("parsePathID missing prefix = %d", got)
	}

	rec := httptest.NewRecorder()
	plugin.requireUser(func(http.ResponseWriter, *http.Request) {
		t.Fatalf("handler should not be called")
	})(rec, httptest.NewRequest(http.MethodGet, "/x", nil))
	if rec.Code != http.StatusForbidden {
		t.Fatalf("forbidden status = %d", rec.Code)
	}

	req := httptest.NewRequest(http.MethodGet, "/x", nil)
	req.Header.Set(headerEntry, "user")
	rec = httptest.NewRecorder()
	plugin.requireUser(func(http.ResponseWriter, *http.Request) {
		t.Fatalf("handler should not be called")
	})(rec, req)
	if rec.Code != http.StatusUnauthorized {
		t.Fatalf("missing user status = %d", rec.Code)
	}

	req.Header.Set(headerUserID, "7")
	rec = httptest.NewRecorder()
	plugin.requireUser(func(http.ResponseWriter, *http.Request) {
		t.Fatalf("handler should not be called")
	})(rec, req)
	if rec.Code != http.StatusServiceUnavailable {
		t.Fatalf("unconfigured status = %d", rec.Code)
	}

	plugin.svc = &Service{}
	called := false
	rec = httptest.NewRecorder()
	plugin.requireUser(func(w http.ResponseWriter, r *http.Request) {
		called = true
		writeJSON(w, http.StatusAccepted, map[string]string{"ok": "true"})
	})(rec, req)
	if !called || rec.Code != http.StatusAccepted {
		t.Fatalf("authorized status=%d called=%v", rec.Code, called)
	}

	validationCases := []struct {
		name string
		run  func(*httptest.ResponseRecorder)
		want int
	}{
		{"create bad json", func(rec *httptest.ResponseRecorder) {
			plugin.handleCreateConversation(rec, playgroundRequest(http.MethodPost, "/conversations", []byte("{"), 7, ""))
		}, http.StatusBadRequest},
		{"get bad id", func(rec *httptest.ResponseRecorder) {
			plugin.handleGetConversation(rec, playgroundRequest(http.MethodGet, "/conversations/nope", nil, 7, ""))
		}, http.StatusBadRequest},
		{"update bad id", func(rec *httptest.ResponseRecorder) {
			plugin.handleUpdateConversation(rec, playgroundRequest(http.MethodPut, "/conversations/nope", []byte(`{}`), 7, ""))
		}, http.StatusBadRequest},
		{"update bad json", func(rec *httptest.ResponseRecorder) {
			plugin.handleUpdateConversation(rec, playgroundRequest(http.MethodPut, "/conversations/1", []byte("{"), 7, ""))
		}, http.StatusBadRequest},
		{"delete bad id", func(rec *httptest.ResponseRecorder) {
			plugin.handleDeleteConversation(rec, playgroundRequest(http.MethodDelete, "/conversations/nope", nil, 7, ""))
		}, http.StatusBadRequest},
		{"list messages bad id", func(rec *httptest.ResponseRecorder) {
			plugin.handleListMessages(rec, playgroundRequest(http.MethodGet, "/messages/nope", nil, 7, ""))
		}, http.StatusBadRequest},
		{"persist bad json", func(rec *httptest.ResponseRecorder) {
			plugin.handlePersistMessage(rec, playgroundRequest(http.MethodPost, "/messages", []byte("{"), 7, ""))
		}, http.StatusBadRequest},
		{"persist missing conversation", func(rec *httptest.ResponseRecorder) {
			plugin.handlePersistMessage(rec, playgroundRequest(http.MethodPost, "/messages", []byte(`{"role":"user"}`), 7, ""))
		}, http.StatusBadRequest},
		{"persist missing role", func(rec *httptest.ResponseRecorder) {
			plugin.handlePersistMessage(rec, playgroundRequest(http.MethodPost, "/messages", []byte(`{"conversation_id":1}`), 7, ""))
		}, http.StatusBadRequest},
		{"update message bad id", func(rec *httptest.ResponseRecorder) {
			plugin.handleUpdateMessage(rec, playgroundRequest(http.MethodPut, "/messages/nope", []byte(`{}`), 7, ""))
		}, http.StatusBadRequest},
		{"update message bad json", func(rec *httptest.ResponseRecorder) {
			plugin.handleUpdateMessage(rec, playgroundRequest(http.MethodPut, "/messages/1", []byte("{"), 7, ""))
		}, http.StatusBadRequest},
	}
	for _, tc := range validationCases {
		t.Run(tc.name, func(t *testing.T) {
			rec := httptest.NewRecorder()
			tc.run(rec)
			if rec.Code != tc.want {
				t.Fatalf("status = %d body=%s", rec.Code, rec.Body.String())
			}
		})
	}

	info := BuildPluginInfo()
	if info.ID != "airgate-playground" || len(info.Capabilities) == 0 || len(info.ConfigSchema) != 1 || len(info.FrontendPages) != 1 {
		t.Fatalf("info = %#v", info)
	}
	if New().Info().ID != info.ID {
		t.Fatalf("New/Info mismatch")
	}
	routeRecorder := &playgroundRouteRecorder{}
	plugin.RegisterRoutes(routeRecorder)
	if len(routeRecorder.routes) != 10 {
		t.Fatalf("registered routes = %#v", routeRecorder.routes)
	}
	lifecyclePlugin := &Plugin{}
	if err := lifecyclePlugin.Init(nil); err != nil {
		t.Fatalf("Init nil: %v", err)
	}
	if err := lifecyclePlugin.Init(playgroundFakeContext{host: &playgroundFakeHost{}, cfg: testPluginConfig{}}); err != nil {
		t.Fatalf("Init no dsn: %v", err)
	}
	if err := lifecyclePlugin.Start(context.Background()); err != nil {
		t.Fatalf("Start: %v", err)
	}
	if err := lifecyclePlugin.Stop(context.Background()); err != nil {
		t.Fatalf("Stop: %v", err)
	}
	if err := lifecyclePlugin.Migrate(); err != nil {
		t.Fatalf("Migrate nil DB: %v", err)
	}
	if tasks := lifecyclePlugin.BackgroundTasks(); tasks != nil {
		t.Fatalf("BackgroundTasks without svc = %#v", tasks)
	}
	if lifecyclePlugin.Configured() {
		t.Fatalf("plugin should be unconfigured after Init without DSN")
	}
}

func TestServicePureHelpersAdditional(t *testing.T) {
	host := &playgroundFakeHost{responses: map[string]*sdk.HostInvokeResponse{
		hostMethodAssetsDelete: {Status: "ok", Payload: map[string]interface{}{}},
	}}
	storage := &ObjectStorage{host: host}
	service := NewService(slog.Default(), nil, host, storage, 15)
	if service.logger == nil || service.host != host || service.storage != storage || service.maxConversationsPerUser != 15 {
		t.Fatalf("service = %#v", service)
	}

	if got, err := (&Service{}).storeContentAssets(context.Background(), 1, 2, "plain"); err != nil || got != "plain" {
		t.Fatalf("storeContentAssets without storage = %q, %v", got, err)
	}
	if got, err := service.storeContentAssets(context.Background(), 1, 2, "plain"); err != nil || got != "plain" {
		t.Fatalf("storeContentAssets without data = %q, %v", got, err)
	}
	if got, err := (&Service{}).resolveAssetURLs(context.Background(), 1, "plain"); err != nil || got != "plain" {
		t.Fatalf("resolveAssetURLs without storage = %q, %v", got, err)
	}
	if err := (&Service{}).deleteAssetsFromStorage(context.Background(), nil); err != nil {
		t.Fatalf("delete nil assets: %v", err)
	}
	if err := service.deleteAssetsFromStorage(context.Background(), []Asset{{ID: "blank"}, {ID: "a", ObjectKey: "chat/1/a.png"}}); err != nil {
		t.Fatalf("delete assets: %v", err)
	}
	if len(host.calls) == 0 || host.calls[len(host.calls)-1].Payload["object_key"] != "chat/1/a.png" {
		t.Fatalf("delete calls = %#v", host.calls)
	}
	host.errors = map[string]error{hostMethodAssetsDelete: errors.New("delete failed")}
	if err := service.deleteAssetsFromStorage(context.Background(), []Asset{{ID: "a", ObjectKey: "chat/1/a.png"}}); err == nil {
		t.Fatalf("deleteAssetsFromStorage should combine errors")
	}

	if got := generateTitle("short"); got != "short" {
		t.Fatalf("short title = %q", got)
	}
	long := strings.Repeat("界", 31)
	if got := generateTitle(long); len([]rune(got)) != 33 || !strings.HasSuffix(got, "...") {
		t.Fatalf("long title = %q", got)
	}
	limitErr := (&conversationLimitError{limit: 3}).Error()
	if !strings.Contains(limitErr, "3") {
		t.Fatalf("limit error = %q", limitErr)
	}
	if got := conversationLimitLockKey(42); got == 0 {
		t.Fatalf("lock key should not be zero")
	}
}

type playgroundRouteRecorder struct {
	routes map[string]http.HandlerFunc
	prefix string
}

func (r *playgroundRouteRecorder) Handle(method, path string, handler http.HandlerFunc) {
	if r.routes == nil {
		r.routes = make(map[string]http.HandlerFunc)
	}
	r.routes[method+" "+r.prefix+path] = handler
}

func (r *playgroundRouteRecorder) Group(prefix string) sdk.RouteRegistrar {
	return &playgroundRouteRecorder{routes: r.routes, prefix: r.prefix + prefix}
}

func TestAssetsLoadingAdditional(t *testing.T) {
	plugin := &Plugin{}
	root := t.TempDir()
	if got := loadAssetsFromDir(filepath.Join(root, "missing")); got != nil {
		t.Fatalf("missing assets = %#v", got)
	}
	if err := os.MkdirAll(filepath.Join(root, "assets"), 0o700); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(root, "index.html"), []byte("html"), 0o600); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(root, "assets", "app.js"), []byte("js"), 0o600); err != nil {
		t.Fatal(err)
	}
	loaded := loadAssetsFromDir(root)
	if string(loaded["index.html"]) != "html" || string(loaded["assets/app.js"]) != "js" {
		t.Fatalf("loaded assets = %#v", loaded)
	}

	devRoot := t.TempDir()
	if err := os.MkdirAll(filepath.Join(devRoot, "web", "dist"), 0o700); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(devRoot, "web", "dist", "index.html"), []byte("dev"), 0o600); err != nil {
		t.Fatal(err)
	}
	t.Chdir(devRoot)
	if assets := loadDevAssets(); string(assets["index.html"]) != "dev" {
		t.Fatalf("dev assets = %#v", assets)
	}
	if assets := plugin.GetWebAssets(); string(assets["index.html"]) != "dev" {
		t.Fatalf("GetWebAssets = %#v", assets)
	}
}

func TestWriteHostForwardErrorAdditional(t *testing.T) {
	rec := httptest.NewRecorder()
	writeHostForwardError(rec, errors.New("plain"))
	if rec.Code != http.StatusServiceUnavailable {
		t.Fatalf("plain error status = %d", rec.Code)
	}
	rec = httptest.NewRecorder()
	writeHostForwardError(rec, status.Error(codes.ResourceExhausted, "quota"))
	if rec.Code != http.StatusPaymentRequired {
		t.Fatalf("quota status = %d", rec.Code)
	}
	rec = httptest.NewRecorder()
	writeHostForwardError(rec, status.Error(codes.InvalidArgument, ""))
	if rec.Code != http.StatusBadRequest || !strings.Contains(rec.Body.String(), "invalid_request") {
		t.Fatalf("invalid empty status=%d body=%s", rec.Code, rec.Body.String())
	}
	dst := http.Header{}
	copyHeaders(dst, http.Header{"A": []string{"1", "2"}})
	if got := dst.Values("A"); len(got) != 2 {
		t.Fatalf("copied headers = %#v", dst)
	}
}

func playgroundRequest(method, target string, body []byte, userID int, platform string) *http.Request {
	req := httptest.NewRequest(method, target, bytes.NewReader(body))
	req.Header.Set(headerEntry, "user")
	if userID > 0 {
		req.Header.Set(headerUserID, fmt.Sprint(userID))
	}
	if platform != "" {
		req.Header.Set(headerPlatform, platform)
	}
	return req
}
