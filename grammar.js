IDENT = /[A-Za-z_$][A-Za-z0-9_'$]*/

PREC = {
  SEQ: 10,
  SINGLE_GROUP: 20,
  ADDR: 20,
  EVAL: 20,
  BINEXP: 30,
}

ENDLINE = token.immediate(/\r?\n/)

IDDLR_KEYWORDS = [
  "$tup",
  "$rec",
  "$tup_t0",
  "$tup_vt",
  "$rec_t0",
  "$rec_vt",
  "$raise",
  "$extnam",
  "$exists",
]

IDDLR_RULES = Object.fromEntries(IDDLR_KEYWORDS.map(kwd =>
  ["kwd_" + kwd.substring(1), $ => kwd]))

IDSRP_KEYWORDS = [
  "#infix0",
  "#infixl",
  "#infixr",
  "#prefix",
  "#pstfix",
  "#nonfix",

  "#static",
  "#extern",
  "#staval",
  "#extval",

  "#define",
  "#macdef",

  "#include",
  "#staload",
  "#symload",

  "#dynload",
  "#dyninit",
]

IDSRP_RULES = Object.fromEntries(IDSRP_KEYWORDS.map(kwd =>
  ["kwd_" + kwd.substring(1), $ => kwd]))

POUND_KEYWORDS = [
  "#stacst0",

  "#abssort",
  "#sortdef",

  "#sexpdef",
  "#propdef",
  "#viewdef",
  "#tboxdef",
  "#typedef",
  "#vwtpdef",

  "#abstype",
  "#absprop",
  "#absview",
  "#abstbox",
  "#abstflt",
  "#absvtbx",
  "#absvtft",
  "#absvwtp",

  "#absimpl",
  "#absopen",

  "#implmnt",
  "#implprf",
  "#implval",
  "#implfun",
  "#impltmp",
  "#impltmpr",
]

POUND_RULES = Object.fromEntries(POUND_KEYWORDS.map(kwd =>
  ["kwd_" + kwd.substring(1), $ => kwd]))

DOLLAR_KEYWORDS = [
  "$addr",
  "$eval",
  "$fold",
  "$free",
  "$lazy",
  "$llazy",
]

DOLLAR_RULES = Object.fromEntries(DOLLAR_KEYWORDS.map(kwd =>
  ["kwd_" + kwd.substring(1), $ => kwd]))

OTHER_KEYWORDS = [
  "as",
  "of",
  "op",
  "in",

  "and",
  "end",

  "if",
  "sif",
  "then",
  "else",

  "when",
  "with",

  "scas",

  "case0",
  "case1",

  "endst",

  "lam",
  "fix",

  "let",
  "try",
  "where",
  "local",

  "endif",
  "endcas",
  "endlam",
  "endlet",
  "endtry",
  "endwhr",
  "endloc",
  "endwhere",
  "endlocal",

  "fn",

  "vlr",
  "var",

  "fn0",
  "fn1",
  "fnx",
  "fun",

  "prv",
  "prf",

  "prfn0",
  "prfn1",
  "prfun",
  "praxi",

  "prval",
  "prvar",
  "fcast",

  "excptcon",
  "datasort",

  "dataprop",
  "dataview",
  "datatype",
  "datavwtp",

  "datavtype",

  "withtype",
  "withprop",
  "withview",
  "withvwtp",

  "withvtype",
]

OTHER_RULES = Object.fromEntries(OTHER_KEYWORDS.map(kwd =>
  ["kwd_" + kwd, $ => kwd]))

SINGLE_GROUP_FUNS = [
  ["$addr", "&"],
  ["$eval", "!"],
  ["$fold", null],
  ["$free", null],
  ["$lazy", null],
  ["$llazy", null],
  ["$raise", null],
  ["$tup", null],
  ["$tup_t0", null],
  ["$tup_vt", null],
  ["$rec", null],
  ["$rec_t0", null],
  ["$rec_vt", null],
]

SINGLE_GROUP_RULES = Object.fromEntries(SINGLE_GROUP_FUNS.map(([kwd, abbr]) => {
  let name = kwd.substring(1);
  let kwd_name = "kwd_" + name;

  return [name + "_expr", $ => {
    base = seq(
      $[kwd_name],
      token.immediate('('),
      $._expr,
      ')',
    );

    if (abbr != null) {
      return choice(
        base,
        // TODO(GZGZ): token.immediate can only be used on terminal
        // symbols
        prec.left(seq(abbr, $._expr)),
      );
    } else {
      return base;
    }
  }];
}))

SINGLE_PREPROC_KEYWORDS = [
  "abstbox",
]

SINGLE_PREPROC_RULES = Object.fromEntries(SINGLE_PREPROC_KEYWORDS.map(kwd => {
  return [kwd + "_statement", $ => seq(
    $["kwd_" + kwd],
    $.ident,
    ENDLINE,
  )]
}))

SINGLE_DEF_KEYWORDS = [
  "typedef",
]

SINGLE_DEF_RULES = Object.fromEntries(SINGLE_DEF_KEYWORDS.map(kwd => {
  return [kwd + "_statement", $ => seq(
    $["kwd_" + kwd],
    $.ident,
    $.symbol,
    $._expr,
  )]
}))

module.exports = grammar({
  name: 'xats',

  extras: $ => [
    /\s/,
    $.comment,
  ],

  // word: $ => $.ident,

  externals: $ => [
    $.comment,
    // $.string,
    // $.character,
  ],

  rules: {
    // TODO: add the actual grammar rules
    source_file: $ => repeat($._stmts),

    ident: $ => IDENT,

    _stmts: $ => choice(
      $.include_statement,
      $.staload_statement,
      $.dynload_statement,
      $.define_statement,
      $.local_statement,
      $._decl_statement,
      $._intro_statement,
      $._impl_statement,
      $.symload_statement,
      $.abstbox_statement,
      $.typedef_statement,
      $.datatype_def_statement,
    ),

    symbol: $ => /[<>@=+\-*/%~!&|.$]+/,

    arrow: $ => "->",

    /*
    * Extra keywords
    */
    kwd_case: $ => choice("case", "case+", "case-"),

    /*
     * Literals
     */

    _literal: $ => choice(
      $.string_literal,
      $.int_literal,
      $.float_literal,
      $.char_literal,
      $.unit_literal,
      $.bool_literal,
    ),

    /**
     * TODO: maybe borrow from tree-sitter-c directly?
     * This should suffice for now.
     */
    string_literal: $ => seq(
      "\"",
      repeat(choice(
        token.immediate(prec(1, /[^\\"\n]+/)),
        $.escape_sequence,
      )),
      "\"",
    ),

    bool_literal: $ => choice("true", "false"),

    // TODO: other bases
    int_literal: $ => /(-)?[0-9]+/, /* seq(
      optional('-'),
      choice(
        /[0-9]+/,
        seq(
          "0x",
          /[0-9a-eA-E]+/,
        ),
      ),
    ), */

    float_literal: $ => choice(
      seq(/(-)?[0-9]+/, choice("e", "E"), /(-)?[0-9]+/),
      seq(/(-)?[0-9]+/, ".", /[0-9]*/),
    ),

    char_literal: $ => seq(
      choice('L\'', 'u\'', 'U\'', 'u8\'', '\''),
      repeat1(choice(
      $.escape_sequence,
      alias(token.immediate(/[^\n']/), $.character),
      )),
      '\'',
    ),

    unit_literal: $ => seq('(', ')'),

    escape_sequence: _ => token(prec(1, seq(
      '\\',
      choice(
        /[^xuU]/,
        /\d{2,3}/,
        /x[0-9a-fA-F]{2,}/,
        /u[0-9a-fA-F]{4}/,
        /U[0-9a-fA-F]{8}/,
      ),
    ))),

    // IDDLR keywords
    ...IDDLR_RULES,
    // IDSRP keywords
    ...IDSRP_RULES,
    // other #... keywords
    ...POUND_RULES,
    // other $... keywords
    ...DOLLAR_RULES,
    // all other keywords that don't start with any special symbols
    ...OTHER_RULES,

    template: $ => seq(
      '<',
      optional(seq($.ident, repeat(seq(',', $.ident)))),
      '>',
    ),

    /*
     * Statements
     */

    include_statement: $ => seq(
      $.kwd_include,
      $.string_literal,
      ENDLINE,
    ),

    staload_statement: $ => seq(
      $.kwd_staload,
      optional(seq($.ident, $.symbol)),
      $.string_literal,
      ENDLINE,
    ),

    dynload_statement: $ => seq(
      $.kwd_dynload,
      optional(seq($.ident, $.symbol)),
      $.string_literal,
      ENDLINE,
    ),

    define_statement: $ => seq(
      $.kwd_define,
      $.ident,
      $._expr,
    ),

    local_statement: $ => seq(
      $.kwd_local,
      repeat($._stmts),
      $.kwd_in,
      repeat($._stmts),
      choice($.kwd_endloc, $.kwd_endlocal, $.kwd_end),
    ),

    _decl_statement: $ => choice(
      $.val_decl_statement,
      $.fun_decl_statement,
    ),

    _intro_statement: $ => choice(
      $.val_intro_statement,
      $.fun_intro_statement,
    ),

    _impl_statement: $ => choice(
      $.fun_impl_statement,
      $.val_impl_statement,
    ),

    kwd_val: $ => choice("val", "val+", "val-"),

    _kwd_val_variants: $ => choice(
      $.kwd_val,
      $.kwd_vlr,
      $.kwd_var,
    ),

    val_intro_statement: $ => seq(
      $._kwd_val_variants,
      $.ident,
      ":",
      $._expr,
      ENDLINE,
      repeat(seq(
        "and",
        $.ident,
        ":",
        $._expr,
        ENDLINE,
      )),
    ),

    val_decl_statement: $ => seq(
      $._kwd_val_variants,
      $._pat,
      "=",
      $._expr,
      ENDLINE,
      // choice(
        repeat(seq(
          "and",
          $.ident,
          "=",
          $._expr,
          ENDLINE,
        )),
        // ENDLINE,
      // ),
    ),

    _kwd_fun_variants: $ => choice(
        $.kwd_fun,
        $.kwd_fn,
        $.kwd_fn0,
        $.kwd_fn1,
        $.kwd_fnx,
    ),

    fun_intro_statement: $ => seq(
      $._kwd_fun_variants,
      field("name", $.ident),
      '(',
      seq(
        $.ident,
        optional(seq(':', $._expr)),
        repeat(seq(',', $.ident, optional(seq(':', $.type)))),
      ),
      ')',
      optional(seq(
        ':',
        $._expr,
      )),
      ENDLINE,
    ),

    fun_decl_statement: $ => seq(
      $._kwd_fun_variants,
      field("name", $.ident),
      optional($.template),
      '(',
      seq(
        field("parameter", $.ident),
        optional(seq(':', $.type)),
        repeat(seq(',', $.ident, optional(seq(':', $.type)))),
      ),
      ')',
      optional(seq(
        ':',
        $._expr,
      )),
      "=",
      $._expr,
      ENDLINE,
    ),

    fun_impl_statement: $ => seq(
      choice($.kwd_implfun, $.kwd_impltmp, $.kwd_implmnt),
      field("name", $.ident),
      optional($.template),
      '(',
      optional(seq($.ident, repeat(seq(',', $.ident)))),
      ')',
      '=',
      $._expr,
    ),

    val_impl_statement: $ => seq($.kwd_absimpl, $.ident, '=', $._expr, ENDLINE),

    symload_statement: $ => seq(
      $.kwd_symload,
      repeat1(choice($.symbol, $.ident)),
      $.kwd_with,
      $.ident,
      ENDLINE,
    ),

    ...SINGLE_PREPROC_RULES,
    ...SINGLE_DEF_RULES,

    datatype_def_statement: $ => seq(
      $.kwd_datatype,
      $.ident,
      '=',
      field("constructor", $.ident),
      $.kwd_of,
      $._pat,
      repeat(seq('|', field("constructor", $.ident), $.kwd_of, $._pat)),
    ),

    /*
     * Types
     */

    type: $ => choice(
      $._fun_type,
    ),

    _fun_type: $ => prec.right(seq(
      $._expr,
      $.arrow,
      $._fun_type,
    )),

    /**
    * Pattern
    */

    _pat: $ => choice(
      "_",
      $._literal,
      $.ident,
      $.constructor_pat,
      $.tuple_pat,
    ),

    constructor_pat: $ => seq(
      field("name", $.ident),
      '(',
      optional(seq($._pat, repeat(seq(',', $._pat)))),
      ')',
    ),

    tuple_pat: $ => seq(
      '(',
      $._pat,
      repeat(seq(',', $._pat)),
      ')',
    ),

    /*
     * Expressions
     */

    // A parenthesized expression
    _paren_expr: $ => seq(
      "(",
      $._expr,
      ")",
    ),

    _expr: $ => choice(
      $._paren_expr,
      $._literal,
      $.ident,
      $.invoke_expr,
      $.access_expr,
      ...SINGLE_GROUP_FUNS.map(([kwd, _]) => $[kwd.substring(1) + "_expr"]),
      $.if_then_else_expr,
      $.case_expr,
      $.infix_expr,
      $.let_expr,
      $.where_expr,
      $.seq_expr,
    ),

    access_expr: $ => prec.left(seq(
      choice($._paren_expr, $.ident),
      token.immediate('.'),
      alias(token.immediate(IDENT), $.ident),
    )),

    invoke_expr: $ => seq(
      field("fun", choice($._paren_expr, $.ident, $.access_expr)),
      '(',
      field(
        "parameters",
        optional(seq(
          $._expr,
          repeat(seq(
            ",",
            $._expr,
          )),
        )),
      ),
      ")",
    ),

    ...SINGLE_GROUP_RULES,

    if_then_else_expr: $ => prec.right(seq(
      $.kwd_if,
      $._expr,
      $.kwd_then,
      $._expr,
      optional(seq($.kwd_else, $._expr)),
      optional($.kwd_endif),
    )),

    case_expr: $ => prec.left(seq(
      $.kwd_case,
      $._expr,
      $.kwd_of,
      // TODO: can the first | be omitted?
      // TODO: why the heck doesn't repeat work?!
      repeat1($.case_branch),
      optional($.kwd_endcas),
    )),

    case_branch: $ => seq('|', $._pat, "=>", $._expr),

    infix_expr: $ => prec.left(PREC.BINEXP, seq($._expr, $.symbol, $._expr)),

    let_expr: $ => prec.left(seq(
      $.kwd_let,
      repeat($._stmts),
      $.kwd_in,
      $._expr,
      choice($.kwd_endlet, $.kwd_end),
    )),

    where_expr: $ => prec.left(seq(
      $._paren_expr,
      $.kwd_where,
      '{',
      repeat($._stmts),
      '}',
    )),

    seq_expr: $ => prec.left(PREC.SEQ, seq($._expr, ';', optional($._expr))),
  },
});

/**
  * Creates a preprocessor regex rule
  *
  * @param {RegExp|Rule|String} command
  *
  * @return {AliasRule}
  */
function preprocessor(command) {
  return alias(new RegExp('#[ \t]*' + command), '#' + command);
}
