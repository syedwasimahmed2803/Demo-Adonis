import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import Profile from 'App/Models/Profile'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
export default class ProfilesController {
  public async getUserProfile({ auth, response }: HttpContextContract) {
    try {
      const userId = auth.user?.id
      const profile = await Profile.findByOrFail('user_id', userId)
      return response.ok(profile)
    } catch (error) {
      return response.notFound({ message: 'Profile not found' })
    }
  }

  public async createUserProfile({ request, response, auth }: HttpContextContract) {
    const validations = schema.create({
      gender: schema.enum(['Male', 'Female']),
      mobile_number: schema.string({}, [
        rules.minLength(10),
        rules.maxLength(10),
        rules.regex(/^[0-9]+$/),
      ]),
      name: schema.string({}, [rules.maxLength(25), rules.regex(/^[a-zA-Z]+$/)]),
      date_of_birth: schema.date({ format: 'yyyy-mm-dd' }),
    })
    const data = await request.validate({ schema: validations })
    const user_id = auth.user?.id
    const existingProfile = await Profile.query().where('user_id', user_id).first()
    if (existingProfile) {
      return response.badRequest({ message: 'User already has a profile.' })
    }
    const postData = await Profile.create({ ...data, userid: user_id })

    response.created(postData)
  }
  public async updateUserProfile({ request, response, auth }: HttpContextContract) {
    const validations = schema.create({
      gender: schema.enum(['male', 'female', 'MALE', 'FEMALE', 'Male', 'Female']),
      mobile_number: schema.string({}, [
        rules.minLength(10),
        rules.maxLength(10),
        rules.regex(/^[0-9]+$/),
      ]),
      name: schema.string({}, [rules.maxLength(25), rules.regex(/^[a-zA-Z]+$/)]),
      date_of_birth: schema.date({ format: 'yyyy-mm-dd' }),
    })
    const data = await request.validate({ schema: validations })
    const user_id = auth.user?.id
    const existingProfile = await Profile.query().where('user_id', user_id).first()
    if (!existingProfile) {
      return response.badRequest({ message: 'Profile not Found!!!' })
    }
    await existingProfile.merge(data).save()
    response.send('Profile Updated!')
  }
  public async deleteUserProfile({ response, auth }: HttpContextContract) {
    const user_id = auth.user?.id
    const profile = await Profile.query().where('user_id', user_id).first()
    if (profile) {
      await profile.delete()
      return response.send('Profile has been deleted')
    } else {
      return response.status(404).send('Profile Not Found')
    }
  }
}
