const { User, Book } = require("../models");
const { signToken, AuthenticationError } = require("../utils/auth");

const resolvers = {
  Query: {
    users: async () => {
      return User.find().populate("savedBooks");
    },
    user: async (parent, { username }) => {
      return User.findOne({ username }).populate("savedBooks");
    },
    me: async (parent, args, context) => {
      if (context.user) {
        return User.findOne({ _id: context.user._id }).populate("savedBooks");
      }
      throw new AuthenticationError("You need to be logged in!");
    },
  },
  Mutation: {
    addUser: async (parent, { username, email, password }) => {
      const profile = await User.create({ username, email, password });
      const token = signToken(profile);
      return { token, profile };
    },
    login: async (parent, { email, password }) => {
      const profile = User.findOne({ email });
      if (!profile) {
        throw new AuthenticationError("No profile with this email found!");
      }
      const correctPw = await profile.isCorrectPassword(password);
      if (!correctPw) {
        throw new AuthenticationError("Incorrect password!");
      }
      const token = signToken(profile);
      return { token, profile };
    },
  },
  saveBook: async (parent, { user, body }, context) => {
    if (context.user) {
      return User.findOneAndUpdate(
        { _id: user._id },
        { $addToSet: { savedBooks: body } },
        { new: true, runValidators: true }
      );
    }
    throw new AuthenticationError("You need to be logged in!");
  },
  removeBook: async (parent, { user, params }, context) => {
    if (context.user) {
      return User.findOneAndUpdate(
        { _id: user._id },
        { $pull: { savedBooks: { bookId: params.bookId } } },
        { new: true }
      );
    }
    throw new AuthenticationError("You need to be logged in!");
  },
};

module.exports = resolvers;