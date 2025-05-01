import { validateChangePassword } from './auth.validator.js';
import AuthService from './auth.service.js';
const AuthController = {
  async changePassword(req, res) {
    try {
      const { error } = validateChangePassword(req.body);
      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }

      const { CurrentPassword, NewPassword } = req.body;
      const userId = req.user?.UserId;

      const result = await AuthService.changePassword(
        userId,
        CurrentPassword,
        NewPassword
      );

      res.json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
};

export default AuthController;
