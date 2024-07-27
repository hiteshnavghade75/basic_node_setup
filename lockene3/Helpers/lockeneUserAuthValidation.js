const { check } = require('express-validator');

exports.lockene_user_validation = [
    check('full_name','full name is required').not().isEmpty(),
    check('email','email is required').not().isEmpty(),
    check('email','please enter a valid email').isEmail().normalizeEmail({ gmail_remove_dots : true}),
    check('password','password is required').not().isEmpty(),
    check('password','password must contain at least 6 characters').isLength({min:6}),
    check('mobile_number','mobile number is required').not().isEmpty(),
    check('mobile_number','mobile number should contain at least 10 digits ').isLength({min:10})
]

exports.forgetValidation = [
    check('email','please enter a valid email').isEmail().normalizeEmail({ gmail_remove_dots : true}),
]