import User from './User';
import Mission from './Mission';
import Negotiation from './Negotiation';
import Review from './Review';
import Report from './Report';
import Transaction from './Transaction';
import Notification from './Notification';
import Debt from './Debt';
import AssassinProfile from './AssassinProfile';
import Target from './Target';

// Asociaciones User
User.hasMany(Mission, { foreignKey: 'contractorId', as: 'contractedMissions' });
User.hasMany(Mission, { foreignKey: 'assassinId', as: 'assignedMissions' });
User.hasOne(AssassinProfile, { foreignKey: 'userId', as: 'assassinProfile' });
User.hasMany(Transaction, { foreignKey: 'userId', as: 'transactions' });
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
User.hasMany(Debt, { foreignKey: 'debtorId', as: 'debtsOwed' });
User.hasMany(Debt, { foreignKey: 'creditorId', as: 'debtsOwedToMe' });

// Asociaciones Mission
Mission.belongsTo(User, { foreignKey: 'contractorId', as: 'contractor' });
Mission.belongsTo(User, { foreignKey: 'assassinId', as: 'assassin' });
Mission.hasMany(Negotiation, { foreignKey: 'missionId', as: 'negotiations' });
Mission.hasOne(Review, { foreignKey: 'missionId', as: 'review' });
Mission.hasMany(Report, { foreignKey: 'missionId', as: 'reports' });

// Asociaciones Negotiation
Negotiation.belongsTo(Mission, { foreignKey: 'missionId', as: 'mission' });
Negotiation.belongsTo(User, { foreignKey: 'proposedById', as: 'proposedByUser' });

// Asociaciones Review
Review.belongsTo(Mission, { foreignKey: 'missionId', as: 'mission' });
Review.belongsTo(User, { foreignKey: 'reviewerId', as: 'reviewer' });

// Asociaciones Report
Report.belongsTo(Mission, { foreignKey: 'missionId', as: 'mission' });
Report.belongsTo(User, { foreignKey: 'reporterId', as: 'reporter' });

// Asociaciones Transaction
Transaction.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Asociaciones Notification
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Notification.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });

// Asociaciones Debt
Debt.belongsTo(User, { foreignKey: 'debtorId', as: 'debtor' });
Debt.belongsTo(User, { foreignKey: 'creditorId', as: 'creditor' });

// Asociaciones AssassinProfile
AssassinProfile.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Asociaciones Target
Target.belongsTo(User, { foreignKey: 'targetUserId', as: 'targetUser' });
Target.belongsTo(Debt, { foreignKey: 'debtId', as: 'debt' });

export {
  User,
  Mission,
  Negotiation,
  Review,
  Report,
  Transaction,
  Notification,
  Debt,
  AssassinProfile,
  Target,
};
