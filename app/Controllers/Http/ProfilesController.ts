// import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import Profile from 'App/Models/Profile'

export default class ProfilesController {
  public async getUserProfile() {
    return Profile.all()
  }
}
