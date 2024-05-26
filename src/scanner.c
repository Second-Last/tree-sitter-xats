#include <stdio.h>
#include <stdlib.h>
#include <wchar.h>
#include <wctype.h>

#include "tree_sitter/alloc.h"
#include "tree_sitter/array.h"
#include "tree_sitter/parser.h"

enum TokenType
{
	COMMENT,
};

// Currently we don't need any external state...
void* tree_sitter_XATS_external_scanner_create(void)
{
	return NULL;
}

void tree_sitter_XATS_external_scanner_destroy(void* payload)
{
}

unsigned tree_sitter_XATS_external_scanner_serialize(void* payload, char* buffer)
{
	return 0;
}

void tree_sitter_XATS_external_scanner_deserialize(void* payload, const char* buffer, unsigned length)
{
}

static void advance(TSLexer* lexer)
{
	lexer->advance(lexer, false);
}

static void skip(TSLexer* lexer)
{
	lexer->advance(lexer, true);
}

static bool is_eof(TSLexer* lexer)
{
	return lexer->eof(lexer);
}

bool tree_sitter_XATS_external_scanner_scan(void* payload, TSLexer* lexer, const bool* valid_symbols)
{
	while (iswspace(lexer->lookahead))
	{
		skip(lexer);
	}

	if (valid_symbols[COMMENT])
	{
		// printf("Can be comment: %d, col: %d, lookahead: %c\n", valid_symbols[COMMENT], lexer->get_column(lexer),
		// 	   lexer->lookahead);
		if (lexer->lookahead == '/')
		{
			advance(lexer);
			if (lexer->lookahead == '/')
			{
				lexer->result_symbol = COMMENT;

				// Keep going till EOL
				while (lexer->lookahead != '\n' && lexer->lookahead != '\r')
				{
					advance(lexer);
				}
				lexer->mark_end(lexer);

				return true;
			}
			else
			{
				return false;
			}
		}
		else if (lexer->lookahead == '(')
		{
			advance(lexer);
			if (lexer->lookahead == '*')
			{
				lexer->result_symbol = COMMENT;
				advance(lexer);

				int level = 1;
				while (level >= 1)
				{
					switch (lexer->lookahead)
					{
						case '(':
							advance(lexer);
							if (lexer->lookahead == '*')
							{
								advance(lexer);
								level++;
							}
							break;
						case '*':
							advance(lexer);
							if (lexer->lookahead == ')')
							{
								advance(lexer);
								level--;
							}
							break;
						case '\0':
							if (is_eof(lexer))
							{
								return false;
							}
							break;
						default:
							advance(lexer);
					}
				}
				return level == 0;
			}
			else
			{
				return false;
			}
		}
	}

	return false;
}

// bool scan_comment(TSLexer* lexer)
// {
// }
