// Temporarily disabled for marketplace hiding
const activityLogService = {
  async logActivity(activity: any) {
    return { success: true };
  },

  async getActivities(taskId: string) {
    return [];
  }
};

export { activityLogService };