import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import Profile from 'App/Models/Profile'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import user from 'App/Models/user'
import { DateTime } from 'luxon'
export default class ProfilesController {
  public async getUserProfile({ auth, response }: HttpContextContract) {
    try {
      const userId = auth.user?.id
      const profile = await Profile.findByOrFail('user_id', userId)
      const formattedProfile = {
        ...profile.serialize(),
        date_of_birth: DateTime.fromJSDate(profile.date_of_birth).toFormat('yyyy-MM-dd'),
      }
      const responseData = {
        email: auth.user?.email,
        name: formattedProfile.name,
        date_of_birth: formattedProfile.date_of_birth,
        gender: formattedProfile.gender,
      }
      return response.created(responseData)
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
      date_of_birth: schema.date({ format: 'yyyy-MM-dd' }),
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
      gender: schema.enum.optional(['male', 'female', 'MALE', 'FEMALE', 'Male', 'Female']),
      mobile_number: schema.string.optional({}, [
        rules.minLength(10),
        rules.maxLength(10),
        rules.regex(/^[0-9]+$/),
      ]),
      name: schema.string.optional({}, [rules.maxLength(25), rules.regex(/^[a-zA-Z]+$/)]),
      date_of_birth: schema.date.optional({ format: 'YYYY-MM-DD' }),
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
  public async deleteUserProfile({ request, response, auth }: HttpContextContract) {
    const user_id = auth.user?.id
    const mobile_number = request.input('mobile_number')
    const profile = await Profile.query().where('mobile_number', mobile_number).first()
    if (!profile) {
      return response.status(404).send('Profile not found')
    }

    const userData = await user.findBy('id', user_id)

    if (!userData) {
      return response.status(404).send('User not found')
    }

    await profile.delete()
    await userData.delete()

    return response.send('User and Profile Deleted')
  }
}
