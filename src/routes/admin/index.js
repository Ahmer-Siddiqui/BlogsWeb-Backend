const express = require('express');
const router = express.Router();

// Controllers
const auth = require("../../controllers/admin");
const city = require("../../controllers/admin/cityController");
const area = require("../../controllers/admin/areaController");
const merchant = require("../../controllers/admin/merchantController");
const developer = require("../../controllers/admin/developerController");
const support = require("../../controllers/admin/supportController");
const user = require("../../controllers/admin/userController");
const warning = require("../../controllers/admin/warningController");
const merchantEmployee = require("../../controllers/admin/merchantEmployeesController");

// Middlewares
const { isAuthenticated, isAdmin, SuperAuth } = require('../../middleware/AuthMiddleware');
const { DevAccessAPIOnly, paramIdChecker } = require('../../middleware/BasicMiddleware');
const onlyAdminAccess = [isAuthenticated, isAdmin];
const validateMiddleware = [paramIdChecker]
const validationArr = [...onlyAdminAccess, ...validateMiddleware]

// Auth
router.route("/create").post(onlyAdminAccess, auth.signUp);
router.route("/login").post(auth.login); 
router.route('/get-credentials').get(onlyAdminAccess, auth.getCredentials); 
router.route('/get-admins').get(onlyAdminAccess, auth.getAdmins); 
router.route('/forget-password').post(auth.forgetPassword); 
router.route('/reset-password/:id/:token').put(onlyAdminAccess, auth.resetPassword); 
router.route('/:id').delete(validationArr, auth.deleteAdmin); 
router.route('/update-profile').put(onlyAdminAccess, auth.updateProfile) 
router.route('/change-password').put(onlyAdminAccess, auth.changePassword); 
router.route('/update-credentials').put(onlyAdminAccess, auth.updateCredentials); 

// Developer
router.route("/developer/initialize-app").post([DevAccessAPIOnly, SuperAuth], developer.init);
router.route("/developer/clear-db").delete([DevAccessAPIOnly, SuperAuth], developer.clearDb);

// Support
router.route("/support/alert-messages/:id").delete(validationArr, support.deleteAlertMessage);
router.route("/support/alert-messages").post(onlyAdminAccess, support.postAlertMessage).get(onlyAdminAccess, support.getAllAlertMessage);
router.route("/support/alert-messages/toggle-status/:id").put(validationArr, support.toggleAlertMessageStatus);


// City
router.route("/city").post(onlyAdminAccess, city.add).get(onlyAdminAccess, city.get); 
router.route("/city/:id").get(validationArr, city.getCity).put(validationArr, city.update).delete(validationArr, city.del);

// Area
router.route("/area") .post(onlyAdminAccess, area.add).get(onlyAdminAccess, area.get);
router.route("/area/:id").get(validationArr, area.getArea).put(validationArr, area.update).delete(validationArr, area.del);


// Merchant
router.route('/merchant').post(onlyAdminAccess, merchant.create).get(onlyAdminAccess, merchant.get);
router.route('/merchant/generate-random-password').get(onlyAdminAccess, merchant.generateRandomPassword); 
router.route('/merchant/:id').delete(validationArr, merchant.deleteMerchant).get(validationArr, merchant.getSingleMerchant);
router.route('/merchant-status/:id').put(validationArr, merchant.updateMerchantStatus)

// User
router.route('/all-users').get(onlyAdminAccess, user.getAllUsers); 

// Merchant-Employees
router.route('/all-employees').get(onlyAdminAccess, merchantEmployee.getAllMerchantEmployees); 



// disablity of users, merchant, merchant employees
router.route('/merchant-disable/:id').post(validationArr, merchant.disableMerchant); 
router.route('/merchant-enable/:id').get(validationArr, merchant.enableMerchant); 


// approved merchant
router.route('/merchant-approve/:id').get(validationArr, merchant.approveMerchant); 

// warning for users, merchant, merchant employees
router.route('/warning').post(onlyAdminAccess, warning.generateWarning).get(onlyAdminAccess, warning.getAllWarning); 
router.route('/warning/:id').delete(validationArr, warning.deleteWarning).get(validationArr, warning.getSingleWarning); 




module.exports = router;