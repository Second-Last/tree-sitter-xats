(comment) @comment

(kwd_tup) @keyword
(kwd_rec) @keyword
(kwd_tup_t0) @keyword
(kwd_tup_vt) @keyword
(kwd_rec_t0) @keyword
(kwd_rec_vt) @keyword
(kwd_raise) @keyword
(kwd_extnam) @keyword
(kwd_exists) @keyword

(kwd_infix0) @keyword
(kwd_infixl) @keyword
(kwd_infixr) @keyword
(kwd_prefix) @keyword
(kwd_pstfix) @keyword
(kwd_nonfix) @keyword

(kwd_static) @keyword
(kwd_extern) @keyword
(kwd_staval) @keyword
(kwd_extval) @keyword

(kwd_define) @keyword
(kwd_macdef) @keyword

(kwd_include) @keyword
(kwd_staload) @keyword
(kwd_symload) @keyword

(kwd_dynload) @keyword
(kwd_dyninit) @keyword

(kwd_stacst0) @keyword

(kwd_abssort) @keyword
(kwd_sortdef) @keyword

(kwd_sexpdef) @keyword
(kwd_propdef) @keyword
(kwd_viewdef) @keyword
(kwd_tboxdef) @keyword
(kwd_typedef) @keyword
(kwd_vwtpdef) @keyword

(kwd_abstype) @keyword
(kwd_absprop) @keyword
(kwd_absview) @keyword
(kwd_abstbox) @keyword
(kwd_abstflt) @keyword
(kwd_absvtbx) @keyword
(kwd_absvtft) @keyword
(kwd_absvwtp) @keyword

(kwd_absimpl) @keyword
(kwd_absopen) @keyword

(kwd_implmnt) @keyword
(kwd_implprf) @keyword
(kwd_implval) @keyword
(kwd_implfun) @keyword
(kwd_impltmp) @keyword

(kwd_case) @keyword
(kwd_fun) @keyword
(kwd_var) @keyword
(kwd_val) @keyword
(kwd_of) @keyword
(kwd_end) @keyword
(kwd_endlet) @keyword
(kwd_endcas) @keyword
(kwd_endloc) @keyword
(kwd_with) @keyword
(kwd_let) @keyword
(kwd_in) @keyword

(kwd_local) @keyword
(kwd_datatype) @keyword
(kwd_if) @keyword
(kwd_then) @keyword
(kwd_else) @keyword
(kwd_endif) @keyword

(int_literal) @number
(float_literal) @number
(string_literal) @string
(char_literal) @string
(bool_literal) @constant.builtin
(unit_literal) @constant.builtin

(template) @attribute

(datatype_def_statement constructor: (ident) @constructor)

["(" ")" "{" "}"] @punctuation.bracket
["." "," ":" ";" "|" "=>"] @punctuation.delimiter


(fun_intro_statement name: (ident) @function)
(fun_decl_statement name: (ident) @function)
;; (fun_decl_statement parameter: (ident) @variable.parameter)
(fun_impl_statement name: (ident) @function)

(constructor_pat name: (ident) @constructor)
