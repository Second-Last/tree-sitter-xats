package tree_sitter_ATS_test

import (
	"testing"

	tree_sitter "github.com/smacker/go-tree-sitter"
	"github.com/tree-sitter/tree-sitter-ATS"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_ATS.Language())
	if language == nil {
		t.Errorf("Error loading Ats grammar")
	}
}
