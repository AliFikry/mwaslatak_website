// Controller functions for handling business logic

// Example controller functions
const getHomePage = (req, res) => {
    res.json({
        message: "Welcome to Mwaslatak Website",
        version: "1.0.0"
    });
};

const handleNotFound = (req, res) => {
    res.status(404).json({
        error: "Route not found",
        path: req.path
    });
};

module.exports = {
    getHomePage,
    handleNotFound
};
