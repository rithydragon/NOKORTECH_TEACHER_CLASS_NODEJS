import Joi from 'joi';

export const validateTelegramLink = (data) => {
  const schema = Joi.object({
    linkType: Joi.string().valid('GROUP', 'PERSONAL', 'OFFICIAL', 'STUDY_GROUP').required(),
    telegramLink: Joi.string().uri().pattern(/^https:\/\/t\.me\/.+/).required(),
    linkTitle: Joi.string().max(100).required(),
    linkDescription: Joi.string().allow('').max(500).optional(),
    isActive: Joi.boolean().default(true),
    isOfficial: Joi.boolean().default(false),
    courseId: Joi.number().integer().positive().optional(),
    classId: Joi.number().integer().positive().optional(),
    academicId: Joi.number().integer().positive().optional(),
    departmentId: Joi.number().integer().positive().optional()
  });

  return schema.validate(data);
};