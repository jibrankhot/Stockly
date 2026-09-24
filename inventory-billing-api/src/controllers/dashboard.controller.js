const dashboardService = require('../services/dashboard.service');

const getDashboardSummary = async (req, res) => {
    const summary = await dashboardService.getDashboardSummary();

    res.status(200).json(summary);
};

module.exports = {
    getDashboardSummary
};