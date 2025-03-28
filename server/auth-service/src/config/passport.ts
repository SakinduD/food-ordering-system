import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Profile, VerifyCallback } from 'passport-google-oauth20';
import User, { IUser } from '../models/User';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: '/api/auth/google/callback',
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: VerifyCallback
    ): Promise<void> => {
      try {
        let user: IUser | null = await User.findOne({ email: profile.emails?.[0]?.value });

        if (!user) {
          user = await User.create({
            name: profile.displayName,
            email: profile.emails?.[0]?.value,
            password: '', // optional or randomly generated
            isVerified: true,
            isAdmin: false,
          });
        }

        // Explicitly pass the user or false
        done(null, user || false);
      } catch (err) {
        done(err as Error, false);
      }
    }
  )
);

passport.serializeUser((user: Express.User, done) => {
  // Ensure we're handling the case where user might be undefined
  if (user) {
    const typedUser = user as IUser;
    done(null, typedUser._id);
  } else {
    done(new Error('User not found'));
  }
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    // Pass user or false if not found
    done(null, user || false);
  } catch (err) {
    done(err as Error, false);
  }
});

export default passport;