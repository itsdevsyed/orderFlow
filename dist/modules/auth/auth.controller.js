"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = void 0;
const auth_service_js_1 = require("./auth.service.js");
const register = async (req, res, next) => {
    try {
        const user = await (0, auth_service_js_1.registerUser)(req.body);
        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: user
        });
    }
    catch (error) {
        next(error);
    }
};
exports.register = register;
//# sourceMappingURL=auth.controller.js.map