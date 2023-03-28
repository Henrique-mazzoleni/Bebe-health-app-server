const Parent = require('../models/Parent.model')

const isChildOfLoggedParent = async (req, res, next) => {
    const { childId } = req.params;
    const { _id } = req.payload;
    try {
        const parent = await Parent.findById(_id)

        if (parent?.children.includes(childId)) next()
        else {
            res.status(401).json({message: "request forbiden"})
            return;
        }
    } catch (error) {
        next(error)
    }
}

module.exports = { isChildOfLoggedParent }