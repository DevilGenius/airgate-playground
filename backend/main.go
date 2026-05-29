package main

import (
	sdkgrpc "github.com/DevilGenius/airgate-sdk/runtimego/grpc"

	"github.com/DevilGenius/airgate-playground/backend/internal/playground"
)

func main() {
	sdkgrpc.Serve(playground.New())
}
