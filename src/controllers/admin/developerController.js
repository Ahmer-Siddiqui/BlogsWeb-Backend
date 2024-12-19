const { default: mongoose } = require("mongoose");
// Utils
const ErrorHandler = require("../../utils/apiHandlers/ErrorHandler");
const SuccessHandler = require("../../utils/apiHandlers/SuccessHandler");
// Contants
const adminTemplate = require('../../constant/initials/admin.json');
const cityTemplate = require('../../constant/initials/city.json');
const areaTemplate = require('../../constant/initials/area.json');
const merchantTemplate = require('../../constant/initials/merchant.json');
const userTemplate = require('../../constant/initials/user.json');
// Modals
const Admin = require("../../models/AdminModel");
const City = require("../../models/CityModel");
const Area = require("../../models/AreaModel");
const Merchant = require("../../models/MerchantModel");
const User = require("../../models/UserModel");


const init = async (req, res) => {
    try {

        // Check if already initialize
        const admin = await Admin.findOne({ email: 'admin@gmail.com' });
        if (admin) return ErrorHandler("App already initialzed!", 400, res);

        // Initialize admin db.
        await Admin.create(adminTemplate);
        const city = await City.create(cityTemplate);
        const area = await Area.create({ ...areaTemplate, city: city._id });

        // Initialize merchant db.
        await Merchant.create({ ...merchantTemplate, serviceAreas: [area._id], approved: true });

        // Initialize user db.
        await User.create({ ...userTemplate, area: [area._id] });

        return SuccessHandler(null, 200, res, "Initialized successfully!");
    } catch (error) {
        console.log("Error:", error);
        return ErrorHandler("Internal server error", 500, res);
    }
}

const clearDb = async (req, res) => {
    try {
        const collections = await mongoose.connection.db.listCollections().toArray();
        const collectionNames = collections.map((c) => c.name);

        if (collectionNames.length === 0) {
            return ErrorHandler("No collections found: Database already cleared", 400, res);
        }

        await Promise.all(collectionNames.map((name) => mongoose.connection.db.dropCollection(name)));

        return SuccessHandler(null, 200, res, "All databases deleted successfully!");
    } catch (error) {
        console.log('Error:', error);
        return ErrorHandler('Internal server error', 500, res);
    }

}


module.exports = {
    init,
    clearDb
};
