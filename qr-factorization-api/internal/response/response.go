package response

import (
  "encoding/json"
  "net/http"
)

func JSON(w http.ResponseWriter, status int, data interface{}) {
  w.Header().Set("Content-Type", "application/json")
  w.WriteHeader(status)
  json.NewEncoder(w).Encode(data)
}

func Error(w http.ResponseWriter, status int, message string) {
  JSON(w, status, map[string]interface{}{"success": false, "message": message})
}

func Success(w http.ResponseWriter, status int, data ...interface{}) {
  out := map[string]interface{}{
    "success": true,
  }

  if len(data) > 0 && data[0] != nil {
    out["data"] = data[0]
  }

  JSON(w, status, out)
}
