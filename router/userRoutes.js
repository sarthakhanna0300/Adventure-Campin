const express =require('express');
const userController =require('./../controller/userController.js');
const authController =require('./../controller/authController.js');

const router =express.Router();

router.post('/login',authController.login);
router.post('/signup',authController.signup);
router.get('/logout',authController.logout);
router.post('/forgotPassword',authController.forgotPassword);
router.patch('/resetPassword/:token',authController.resetPassword);

router.use(authController.protect);

router.patch('/updateMyPassword',authController.updatePassword);
router.patch('/updateMe',userController.uploadUserPhoto,userController.resizeUserPhoto,userController.updateMe);
router.delete('/deleteMe',userController.deleteMe);
router.get('/me',userController.getMe,userController.getUser);

router.use(authController.restrictTo('admin'));


router
.route('/')
.get(userController.getAllUsers)    
.post(userController.newUser);

router
.route('/:id')
.get(userController.getUser)
.patch(userController.updateUser)
.delete(userController.deleteUser);

module.exports =router; 