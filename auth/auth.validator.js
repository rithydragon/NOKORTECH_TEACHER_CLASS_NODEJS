import Joi from 'joi'

const changePasswordSchema = Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(8).required(),
    confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
  });
  
  export const validateChangePassword = (data) => {
    return changePasswordSchema.validate(data);
  };
  