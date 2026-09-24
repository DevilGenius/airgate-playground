package playground

import (
	"context"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	sdk "github.com/DevilGenius/airgate-sdk/sdkgo"
)

func TestPlaygroundStopsOnHostDoneAndForwardsFinalData(t *testing.T) {
	stream := &playgroundFakeStream{frames: []*sdk.HostStreamFrame{{Done: true, Payload: map[string]interface{}{"data": "data: [DONE]\n\n"}}}, err: context.Canceled}
	host := &playgroundFakeHost{stream: stream}
	p := &Plugin{host: host, svc: &Service{logger: slog.Default(), storage: &ObjectStorage{host: host}}, logger: slog.Default()}
	w := httptest.NewRecorder()
	p.handleChatCompletions(w, playgroundRequest(http.MethodPost, "/chat/completions", []byte(`{"model":"gpt","stream":true}`), 7, "openai"))
	if w.Body.String() != "data: [DONE]\n\n" || strings.Contains(w.Body.String(), "upstream_error") || !stream.closed {
		t.Fatalf("terminal data/host close handling: %q", w.Body.String())
	}
	if stream.err == nil {
		t.Fatal("read again after authoritative done frame")
	}
}
