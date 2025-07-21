// Temporarily disabled for marketplace hiding
const activityLogService = {
  async logActivity(activity: any) {
    console.log('Activity logging disabled temporarily:', activity);
    return { success: true };
  },

  async getActivities(taskId: string) {
    console.log('Activity retrieval disabled temporarily for task:', taskId);
    return [];
  }
};

export { activityLogService };