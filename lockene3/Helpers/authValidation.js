const { check } = require('express-validator');

exports.authValidation = [
    check('full_name','full name is required').not().isEmpty(),
    check('email','please enter a valid email').isEmail().normalizeEmail({ gmail_remove_dots : true}),
    check('password','password is required').not().isEmpty(),
    check('password','password must contain at least 6 characters').isLength({min:6}),
    check('mobile_number','mobile number is required').isLength({min:10}),
]

exports.forgetValidation = [
    check('email','please enter a valid email').isEmail().normalizeEmail({ gmail_remove_dots : true}),
]