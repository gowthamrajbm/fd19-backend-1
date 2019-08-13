const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const Employee = require("../models/employee.model");
const Prize = require("../models/prize.model");

exports.employee_register = (req, res, next) => {
  console.log(req);
  Employee.find({ $or: [{ eid: req.query.eid }] })
    .exec()
    .then(employee => {
      console.log("employee", employee);
      if (employee.length > 0) {
        return res.status(200).json({
          success: false,
          response: "Employee registered already"
        });
      } else {
        const employeeId = new mongoose.Types.ObjectId();
        const employee = new Employee({
          _id: employeeId,
          eid: req.query.eid,
          name: req.query.name,
          logged_in: false,
          gift: false,
          prize: false
        });

        employee
          .save()
          .then(result => {
            res.status(201).json({
              success: true,
              response: "Employee Registered !"
            });
          })
          .catch(err => {
            res.status(200).json({
              success: false,
              response: "err"
            });
          });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(200).json({
        success: false,
        response: err
      });
    });
};

exports.setGift = (req, res, next) => {
  const employeeId = req.body.eid;
  Employee.updateOne({ eid: employeeId }, { $set: { gift: true } })
    .exec()
    .then(() => {
      return res.status(201).json({
        success: true,
        response: "Gift received"
      });
    })
    .catch(err => {
      return res.status(200).json({
        success: false,
        response: err
      });
    });
};

exports.employee_login = (req, res, next) => {
  const eid = req.query.eid;
  Employee.find({ eid: eid })
    .exec()
    .then(employee => {
      if (employee.length < 1) {
        return res.status(200).json({
          success: false,
          response: "Employee Not Registered!"
        });
      } else {
        if (employee[0].logged_in) {
          return res.status(200).json({
            success: false,
            response: "Employee Logged Already!"
          });
        }
        Employee.updateOne({ eid: eid }, { $set: { gift: true } })
          .exec()
          .then(() => {
            return res.status(201).json({
              success: true,
              response: "Employee Loggedin"
            });
          })
          .catch(err => {
            return res.status(200).json({
              success: false,
              response: "Unable to login"
            });
          });
      }
    })
    .catch(err => {
      res.status(200).json({
        success: false,
        response: err
      });
    });
};

exports.checkPrize = (req, res, next) => {
  Prize.find({
    draw1: req.query.draw1,
    draw2: req.query.draw2,
    draw3: req.query.draw3,
    done: false
  })
    .then(employees => {
      console.log(employees);
      if (employees.length > 0) {
        Prize.update(
          { _id: employees[0]._id },
          { $set: { eid: req.query.eid } }
        )
          .then(response => {
            return res.status(200).json({
              success: true,
              response: employees[0].prize
            });
          })
          .catch(err => {
            console.log(err);
          });
      } else {
        return res.status(200).json({
          success: false,
          response: "No Prize"
        });
      }
    })
    .catch(err => {
      return res.status(200).json({
        success: false,
        response: "Unknown Error!"
      });
    });
};
