import { comparePassword, hashPassword } from '../utils/password.utils.js';
import User from '../models/user.models.js';

const AuthService = {
  async changePassword(userId, currentPassword, newPassword) {
    const user = await UserModel.findByPk(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    const isMatch = await comparePassword(currentPassword, user.password);
    if (!isMatch) {
      throw new Error('Current password is incorrect');
    }

    const hashedPassword = await hashPassword(newPassword);
    await User.updatePassword(userId, hashedPassword);

    return { message: 'Password changed successfully' };
  }
};

export default AuthService;
