import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import { schema, rules } from '@ioc:Adonis/Core/Validator'

import user from 'App/Models/user'

export default class AuthController {
  public async register({ request, response }: HttpContextContract) {
    const validations = schema.create({
      email: schema.string({}, [rules.email(), rules.unique({ table: 'users', column: 'email' })]),
      password: schema.string({}, [
        rules.minLength(8),
        rules.maxLength(16),
        rules.regex(/^[a-zA-Z0-9]+$/),
      ]),
    })
    const data = await request.validate({ schema: validations })
    const postData = await user.create(data)
    const responseData = {
      id: postData.id,
      email: postData.email,
      created_at: postData.createdAt,
      updated_at: postData.updatedAt,
    }
    response.created(responseData)
  }

  public async login({ request, auth }: HttpContextContract) {
    const email = request.input('email')
    const password = request.input('password')
    const token = await auth.attempt(email, password)

    return token.toJSON()
  }
  public async logout({ auth, response }: HttpContextContract) {
    await auth.logout()
    response.send({ message: 'User logged out' })
  }
}
