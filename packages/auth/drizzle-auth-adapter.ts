import { Adapter } from '@auth/core/adapters'
import { db } from '@vizo/drizzle'
import { account, session, user } from '@vizo/drizzle/schema'
import { and, eq, getTableColumns } from 'drizzle-orm'

export const drizzleAuthAdapter: Adapter = {
  async createUser(userToCreate) {
    const [drizzleUser] = await db
      .insert(user)
      .values({
        id: crypto.randomUUID(),
        name: userToCreate.name,
        email: userToCreate.email,
        emailVerified: userToCreate.emailVerified,
        image: userToCreate.image,
      })
      .returning()

    return drizzleUser
  },

  async getUser(id) {
    const authUser = await db.query.user.findFirst({
      where(fields, { eq }) {
        return eq(fields.id, id)
      },
    })

    return authUser || null
  },

  async getUserByEmail(email) {
    const authUser = await db.query.user.findFirst({
      where(fields, { eq }) {
        return eq(fields.email, email)
      },
    })

    return authUser || null
  },

  async getUserByAccount({ providerAccountId, provider }) {
    const [authUser] = await db
      .select({
        user: getTableColumns(user),
      })
      .from(user)
      .innerJoin(account, eq(account.userId, user.id))
      .where(
        and(
          eq(account.provider, provider),
          eq(account.providerAccountId, providerAccountId),
        ),
      )

    return authUser?.user || null
  },

  async updateUser({ id, ...userToUpdate }) {
    const [drizzleUser] = await db
      .update(user)
      .set(userToUpdate)
      .where(eq(user.id, id))
      .returning()

    return drizzleUser
  },

  async linkAccount(accountToCreate) {
    await db.insert(account).values({
      ...accountToCreate,
      type: accountToCreate.type as 'oauth',
      accessToken: accountToCreate.access_token,
      tokenType: accountToCreate.token_type,
    })
  },

  async createSession(sessionToCreate) {
    const [drizzleSession] = await db
      .insert(session)
      .values(sessionToCreate)
      .returning()

    return drizzleSession
  },

  async getSessionAndUser(sessionToken) {
    const drizzleSession = await db.query.session.findFirst({
      where(fields, { eq }) {
        return eq(fields.sessionToken, sessionToken)
      },
      with: {
        user: true,
      },
    })

    if (!drizzleSession) {
      return null
    }

    const { user, ...session } = drizzleSession

    return {
      user,
      session,
    }
  },

  async updateSession({ sessionToken, ...sessionToUpdate }) {
    const [drizzleSession] = await db
      .update(session)
      .set(sessionToUpdate)
      .where(eq(session.sessionToken, sessionToken))
      .returning()

    return drizzleSession
  },

  async deleteSession(sessionToken) {
    await db.delete(session).where(eq(session.sessionToken, sessionToken))
  },
}
