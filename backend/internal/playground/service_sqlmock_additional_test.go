package playground

import (
	"context"
	"database/sql"
	"encoding/base64"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	sdk "github.com/DevilGenius/airgate-sdk/sdkgo"
)

func TestServiceConversationSQLMockAdditional(t *testing.T) {
	ctx := context.Background()
	now := time.Now().UTC()
	service, mock, closeDB := newSQLMockService(t, nil, nil, 0)
	defer closeDB()

	mock.ExpectBegin()
	mock.ExpectQuery("INSERT INTO playground_conversations").
		WithArgs(7, "title", int64(3), "openai", "gpt").
		WillReturnRows(sqlmock.NewRows([]string{"id", "created_at", "updated_at"}).AddRow(int64(11), now, now))
	mock.ExpectCommit()
	conv, err := service.CreateConversation(ctx, 7, "title", 3, "openai", "gpt")
	if err != nil || conv.ID != 11 || conv.UserID != 7 {
		t.Fatalf("CreateConversation = %#v, %v", conv, err)
	}

	mock.ExpectQuery("SELECT id, user_id, title, group_id, platform, model, created_at, updated_at").
		WithArgs(7).
		WillReturnRows(sqlmock.NewRows(conversationColumns()).AddRow(int64(11), 7, "title", int64(3), "openai", "gpt", now, now))
	convs, err := service.ListConversations(ctx, 7)
	if err != nil || len(convs) != 1 || convs[0].Model != "gpt" {
		t.Fatalf("ListConversations = %#v, %v", convs, err)
	}

	mock.ExpectQuery("SELECT id, user_id, title, group_id, platform, model, created_at, updated_at").
		WithArgs(int64(11), 7).
		WillReturnRows(sqlmock.NewRows(conversationColumns()).AddRow(int64(11), 7, "title", int64(3), "openai", "gpt", now, now))
	got, err := service.GetConversation(ctx, 7, 11)
	if err != nil || got == nil || got.ID != 11 {
		t.Fatalf("GetConversation = %#v, %v", got, err)
	}

	mock.ExpectQuery("SELECT id, user_id, title, group_id, platform, model, created_at, updated_at").
		WithArgs(int64(12), 7).
		WillReturnError(sql.ErrNoRows)
	missing, err := service.GetConversation(ctx, 7, 12)
	if err != nil || missing != nil {
		t.Fatalf("GetConversation missing = %#v, %v", missing, err)
	}

	mock.ExpectExec("UPDATE playground_conversations").
		WithArgs("new title", int64(4), "anthropic", "claude", int64(11), 7).
		WillReturnResult(sqlmock.NewResult(0, 1))
	if err := service.UpdateConversation(ctx, 7, 11, "new title", 4, "anthropic", "claude"); err != nil {
		t.Fatalf("UpdateConversation: %v", err)
	}

	mock.ExpectQuery("SELECT id, user_id, conversation_id, object_key, content_type, size_bytes, created_at").
		WithArgs(7, int64(11)).
		WillReturnRows(sqlmock.NewRows(assetColumns()))
	mock.ExpectBegin()
	mock.ExpectExec("DELETE FROM playground_assets WHERE user_id").
		WithArgs(7, int64(11)).
		WillReturnResult(sqlmock.NewResult(0, 0))
	mock.ExpectExec("DELETE FROM playground_conversations").
		WithArgs(int64(11), 7).
		WillReturnResult(sqlmock.NewResult(0, 1))
	mock.ExpectCommit()
	if err := service.DeleteConversation(ctx, 7, 11); err != nil {
		t.Fatalf("DeleteConversation: %v", err)
	}

	assertSQLMockExpectations(t, mock)
}

func TestServiceConversationLimitSQLMockAdditional(t *testing.T) {
	service, mock, closeDB := newSQLMockService(t, nil, nil, 1)
	defer closeDB()
	mock.ExpectBegin()
	mock.ExpectExec("SELECT pg_advisory_xact_lock").
		WithArgs(conversationLimitLockKey(7)).
		WillReturnResult(sqlmock.NewResult(0, 0))
	mock.ExpectQuery("SELECT COUNT").
		WithArgs(7).
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(1))
	mock.ExpectRollback()
	_, err := service.CreateConversation(context.Background(), 7, "title", 0, "", "")
	if err == nil || !strings.Contains(err.Error(), "会话数量已达到上限") {
		t.Fatalf("limit error = %v", err)
	}
	assertSQLMockExpectations(t, mock)
}

func TestServiceMessagesSQLMockAdditional(t *testing.T) {
	ctx := context.Background()
	now := time.Now().UTC()
	service, mock, closeDB := newSQLMockService(t, nil, nil, 0)
	defer closeDB()

	mock.ExpectQuery("SELECT user_id FROM playground_conversations").
		WithArgs(int64(11)).
		WillReturnRows(sqlmock.NewRows([]string{"user_id"}).AddRow(7))
	mock.ExpectQuery("SELECT id, conversation_id, role, content").
		WithArgs(int64(11)).
		WillReturnRows(sqlmock.NewRows(messageColumns()).AddRow(int64(21), int64(11), "user", "hello", "", "", "openai", "gpt", int64(3), 1, 2, 0.01, now))
	msgs, err := service.ListMessages(ctx, 7, 11)
	if err != nil || len(msgs) != 1 || msgs[0].Content != "hello" {
		t.Fatalf("ListMessages = %#v, %v", msgs, err)
	}

	if _, err := service.PersistMessage(ctx, 7, PersistMessageRequest{}); err == nil {
		t.Fatalf("PersistMessage without conversation should fail")
	}
	if _, err := service.PersistMessage(ctx, 7, PersistMessageRequest{ConversationID: 11, Role: "bad"}); err == nil {
		t.Fatalf("PersistMessage with invalid role should fail")
	}

	mock.ExpectQuery("SELECT id, user_id, title, group_id, platform, model, created_at, updated_at").
		WithArgs(int64(11), 7).
		WillReturnRows(sqlmock.NewRows(conversationColumns()).AddRow(int64(11), 7, "title", int64(3), "openai", "gpt", now, now))
	mock.ExpectQuery("INSERT INTO playground_messages").
		WithArgs(int64(11), "assistant", "answer", "why", "medium", "openai", "gpt", int64(3), 4, 5, 0.02).
		WillReturnRows(sqlmock.NewRows([]string{"id", "created_at"}).AddRow(int64(22), now))
	mock.ExpectExec("UPDATE playground_conversations SET updated_at").
		WithArgs(int64(11)).
		WillReturnResult(sqlmock.NewResult(0, 1))
	msg, err := service.PersistMessage(ctx, 7, PersistMessageRequest{
		ConversationID:  11,
		Role:            "assistant",
		Content:         "answer",
		Reasoning:       "why",
		ReasoningEffort: "medium",
		InputTokens:     4,
		OutputTokens:    5,
		Cost:            0.02,
	})
	if err != nil || msg.ID != 22 || msg.Platform != "openai" || msg.GroupID != 3 {
		t.Fatalf("PersistMessage = %#v, %v", msg, err)
	}

	if _, err := service.UpdateMessage(ctx, 7, 0, UpdateMessageRequest{}); err == nil {
		t.Fatalf("UpdateMessage without id should fail")
	}
	mock.ExpectQuery("SELECT m.id, m.conversation_id").
		WithArgs(int64(22)).
		WillReturnRows(sqlmock.NewRows(append(messageColumns(), "user_id")).AddRow(int64(22), int64(11), "assistant", "old", "", "", "openai", "gpt", int64(3), 4, 5, 0.02, now, 7))
	mock.ExpectExec("UPDATE playground_messages").
		WithArgs("new", 5, 7, 0.05, int64(22)).
		WillReturnResult(sqlmock.NewResult(0, 1))
	mock.ExpectExec("UPDATE playground_conversations SET updated_at").
		WithArgs(int64(11)).
		WillReturnResult(sqlmock.NewResult(0, 1))
	updated, err := service.UpdateMessage(ctx, 7, 22, UpdateMessageRequest{Content: "new", InputTokens: 1, OutputTokens: 2, Cost: 0.03})
	if err != nil || updated.Content != "new" || updated.InputTokens != 5 || updated.OutputTokens != 7 {
		t.Fatalf("UpdateMessage = %#v, %v", updated, err)
	}

	mock.ExpectQuery("SELECT content FROM playground_messages").
		WithArgs(int64(11)).
		WillReturnRows(sqlmock.NewRows([]string{"content"}).AddRow("  title seed  "))
	if seed, err := service.latestUserMessageContent(ctx, 11); err != nil || seed != "title seed" {
		t.Fatalf("latestUserMessageContent = %q, %v", seed, err)
	}

	assertSQLMockExpectations(t, mock)
}

func TestServiceAssetsSQLMockAdditional(t *testing.T) {
	ctx := context.Background()
	now := time.Now().UTC()
	host := &playgroundFakeHost{responses: map[string]*sdk.HostInvokeResponse{
		hostMethodAssetsStore:  {Status: "ok", Payload: map[string]interface{}{"asset_id": "asset1", "object_key": "chat/7/asset1.png", "content_type": "image/png", "size_bytes": 3}},
		hostMethodAssetsGetURL: {Status: "ok", Payload: map[string]interface{}{"public_url": "https://assets.test/asset1.png"}},
		hostMethodAssetsDelete: {Status: "ok", Payload: map[string]interface{}{}},
	}}
	service, mock, closeDB := newSQLMockService(t, host, &ObjectStorage{host: host}, 0)
	defer closeDB()

	dataURL := "data:image/png;base64," + base64.StdEncoding.EncodeToString([]byte("png"))
	mock.ExpectExec("INSERT INTO playground_assets").
		WithArgs("asset1", 7, int64(11), "chat/7/asset1.png", "image/png", int64(3)).
		WillReturnResult(sqlmock.NewResult(0, 1))
	content, err := service.storeContentAssets(ctx, 7, 11, "before "+dataURL+" after")
	if err != nil || !strings.Contains(content, "airgate-asset://asset/asset1") {
		t.Fatalf("storeContentAssets = %q, %v", content, err)
	}

	mock.ExpectQuery("SELECT id, user_id, conversation_id, object_key, content_type, size_bytes, created_at").
		WithArgs("asset1", 7).
		WillReturnRows(sqlmock.NewRows(assetColumns()).AddRow("asset1", 7, int64(11), "chat/7/asset1.png", "image/png", int64(3), now))
	resolved, err := service.resolveAssetURLs(ctx, 7, "see airgate-asset://asset/asset1")
	if err != nil || !strings.Contains(resolved, "https://assets.test/asset1.png") {
		t.Fatalf("resolveAssetURLs = %q, %v", resolved, err)
	}

	mock.ExpectQuery("SELECT id, user_id, conversation_id, object_key, content_type, size_bytes, created_at").
		WithArgs(7, int64(11)).
		WillReturnRows(sqlmock.NewRows(assetColumns()).AddRow("asset1", 7, int64(11), "chat/7/asset1.png", "image/png", int64(3), now))
	assets, err := service.listConversationAssets(ctx, 7, 11)
	if err != nil || len(assets) != 1 || assets[0].ID != "asset1" {
		t.Fatalf("listConversationAssets = %#v, %v", assets, err)
	}

	mock.ExpectQuery("SELECT a.id, a.user_id").
		WithArgs(100).
		WillReturnRows(sqlmock.NewRows(assetColumns()).AddRow("asset1", 7, int64(11), "chat/7/asset1.png", "image/png", int64(3), now))
	mock.ExpectExec("DELETE FROM playground_assets WHERE id").
		WithArgs("asset1").
		WillReturnResult(sqlmock.NewResult(0, 1))
	deleted, err := service.CleanupOrphanAssets(ctx, 0)
	if err != nil || deleted != 1 {
		t.Fatalf("CleanupOrphanAssets = %d, %v", deleted, err)
	}

	assertSQLMockExpectations(t, mock)
}

func TestRouteHandlersWithSQLMockAdditional(t *testing.T) {
	now := time.Now().UTC()
	service, mock, closeDB := newSQLMockService(t, nil, nil, 0)
	defer closeDB()
	plugin := &Plugin{svc: service, logger: slog.Default()}

	mock.ExpectBegin()
	mock.ExpectQuery("INSERT INTO playground_conversations").
		WithArgs(7, "title", int64(3), "openai", "gpt").
		WillReturnRows(sqlmock.NewRows([]string{"id", "created_at", "updated_at"}).AddRow(int64(11), now, now))
	mock.ExpectCommit()
	rec := httptest.NewRecorder()
	plugin.handleCreateConversation(rec, playgroundRequest(http.MethodPost, "/conversations", []byte(`{"title":"title","group_id":3,"platform":"openai","model":"gpt"}`), 7, ""))
	if rec.Code != http.StatusCreated {
		t.Fatalf("create conversation status=%d body=%s", rec.Code, rec.Body.String())
	}

	mock.ExpectQuery("SELECT id, user_id, title, group_id, platform, model, created_at, updated_at").
		WithArgs(7).
		WillReturnRows(sqlmock.NewRows(conversationColumns()).AddRow(int64(11), 7, "title", int64(3), "openai", "gpt", now, now))
	rec = httptest.NewRecorder()
	plugin.handleListConversations(rec, playgroundRequest(http.MethodGet, "/conversations", nil, 7, ""))
	if rec.Code != http.StatusOK || !strings.Contains(rec.Body.String(), `"title"`) {
		t.Fatalf("list conversations status=%d body=%s", rec.Code, rec.Body.String())
	}

	mock.ExpectQuery("SELECT id, user_id, title, group_id, platform, model, created_at, updated_at").
		WithArgs(int64(11), 7).
		WillReturnRows(sqlmock.NewRows(conversationColumns()).AddRow(int64(11), 7, "title", int64(3), "openai", "gpt", now, now))
	rec = httptest.NewRecorder()
	plugin.handleGetConversation(rec, playgroundRequest(http.MethodGet, "/conversations/11", nil, 7, ""))
	if rec.Code != http.StatusOK {
		t.Fatalf("get conversation status=%d body=%s", rec.Code, rec.Body.String())
	}

	mock.ExpectQuery("SELECT id, user_id, title, group_id, platform, model, created_at, updated_at").
		WithArgs(int64(404), 7).
		WillReturnError(sql.ErrNoRows)
	rec = httptest.NewRecorder()
	plugin.handleGetConversation(rec, playgroundRequest(http.MethodGet, "/conversations/404", nil, 7, ""))
	if rec.Code != http.StatusNotFound {
		t.Fatalf("missing conversation status=%d body=%s", rec.Code, rec.Body.String())
	}

	mock.ExpectExec("UPDATE playground_conversations").
		WithArgs("new", int64(4), "anthropic", "claude", int64(11), 7).
		WillReturnResult(sqlmock.NewResult(0, 1))
	rec = httptest.NewRecorder()
	plugin.handleUpdateConversation(rec, playgroundRequest(http.MethodPut, "/conversations/11", []byte(`{"title":"new","group_id":4,"platform":"anthropic","model":"claude"}`), 7, ""))
	if rec.Code != http.StatusOK {
		t.Fatalf("update conversation status=%d body=%s", rec.Code, rec.Body.String())
	}

	mock.ExpectQuery("SELECT user_id FROM playground_conversations").
		WithArgs(int64(11)).
		WillReturnRows(sqlmock.NewRows([]string{"user_id"}).AddRow(7))
	mock.ExpectQuery("SELECT id, conversation_id, role, content").
		WithArgs(int64(11)).
		WillReturnRows(sqlmock.NewRows(messageColumns()))
	rec = httptest.NewRecorder()
	plugin.handleListMessages(rec, playgroundRequest(http.MethodGet, "/messages/11", nil, 7, ""))
	if rec.Code != http.StatusOK || rec.Body.String() != "[]\n" {
		t.Fatalf("list messages status=%d body=%s", rec.Code, rec.Body.String())
	}

	mock.ExpectQuery("SELECT id, user_id, title, group_id, platform, model, created_at, updated_at").
		WithArgs(int64(11), 7).
		WillReturnRows(sqlmock.NewRows(conversationColumns()).AddRow(int64(11), 7, "title", int64(3), "openai", "gpt", now, now))
	mock.ExpectQuery("INSERT INTO playground_messages").
		WithArgs(int64(11), "user", "hello", "", "", "openai", "gpt", int64(3), 0, 0, 0.0).
		WillReturnRows(sqlmock.NewRows([]string{"id", "created_at"}).AddRow(int64(21), now))
	mock.ExpectExec("UPDATE playground_conversations SET updated_at").
		WithArgs(int64(11)).
		WillReturnResult(sqlmock.NewResult(0, 1))
	rec = httptest.NewRecorder()
	plugin.handlePersistMessage(rec, playgroundRequest(http.MethodPost, "/messages", []byte(`{"conversation_id":11,"role":"user","content":"hello"}`), 7, ""))
	if rec.Code != http.StatusCreated {
		t.Fatalf("persist message status=%d body=%s", rec.Code, rec.Body.String())
	}

	mock.ExpectQuery("SELECT m.id, m.conversation_id").
		WithArgs(int64(21)).
		WillReturnRows(sqlmock.NewRows(append(messageColumns(), "user_id")).AddRow(int64(21), int64(11), "assistant", "old", "", "", "openai", "gpt", int64(3), 1, 2, 0.1, now, 7))
	mock.ExpectExec("UPDATE playground_messages").
		WithArgs("new", 2, 4, 0.2, int64(21)).
		WillReturnResult(sqlmock.NewResult(0, 1))
	mock.ExpectExec("UPDATE playground_conversations SET updated_at").
		WithArgs(int64(11)).
		WillReturnResult(sqlmock.NewResult(0, 1))
	rec = httptest.NewRecorder()
	plugin.handleUpdateMessage(rec, playgroundRequest(http.MethodPut, "/messages/21", []byte(`{"content":"new","input_tokens":1,"output_tokens":2,"cost":0.1}`), 7, ""))
	if rec.Code != http.StatusOK {
		t.Fatalf("update message status=%d body=%s", rec.Code, rec.Body.String())
	}

	mock.ExpectQuery("SELECT id, user_id, conversation_id, object_key, content_type, size_bytes, created_at").
		WithArgs(7, int64(11)).
		WillReturnRows(sqlmock.NewRows(assetColumns()))
	mock.ExpectBegin()
	mock.ExpectExec("DELETE FROM playground_assets WHERE user_id").
		WithArgs(7, int64(11)).
		WillReturnResult(sqlmock.NewResult(0, 0))
	mock.ExpectExec("DELETE FROM playground_conversations").
		WithArgs(int64(11), 7).
		WillReturnResult(sqlmock.NewResult(0, 1))
	mock.ExpectCommit()
	rec = httptest.NewRecorder()
	plugin.handleDeleteConversation(rec, playgroundRequest(http.MethodDelete, "/conversations/11", nil, 7, ""))
	if rec.Code != http.StatusOK {
		t.Fatalf("delete conversation status=%d body=%s", rec.Code, rec.Body.String())
	}

	assertSQLMockExpectations(t, mock)
}

func newSQLMockService(t *testing.T, host sdk.Host, storage *ObjectStorage, maxConversations int) (*Service, sqlmock.Sqlmock, func()) {
	t.Helper()
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("sqlmock.New: %v", err)
	}
	service := NewService(slog.Default(), db, host, storage, maxConversations)
	return service, mock, func() { _ = db.Close() }
}

func assertSQLMockExpectations(t *testing.T, mock sqlmock.Sqlmock) {
	t.Helper()
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Fatalf("unmet SQL expectations: %v", err)
	}
}

func conversationColumns() []string {
	return []string{"id", "user_id", "title", "group_id", "platform", "model", "created_at", "updated_at"}
}

func messageColumns() []string {
	return []string{"id", "conversation_id", "role", "content", "reasoning", "reasoning_effort", "platform", "model", "group_id", "input_tokens", "output_tokens", "cost", "created_at"}
}

func assetColumns() []string {
	return []string{"id", "user_id", "conversation_id", "object_key", "content_type", "size_bytes", "created_at"}
}
