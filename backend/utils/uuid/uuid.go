package uuid

import (
	"github.com/google/uuid"
	"strings"
)

var ud uuid.UUID

func init() {
	ud = uuid.New()
}

func Get() string {
	return strings.Trim(ud.String(), "-")
}
