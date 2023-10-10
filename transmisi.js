const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const connection = require("./config/db"); // Update the path to your database connection file

// GET all transmisi records
router.get("/", (req, res) => {
  connection.query("SELECT * FROM transmisi", (err, rows) => {
    if (err) {
      return res.status(500).json({
        status: false,
        message: "Server Error",
      });
    } else {
      return res.status(200).json({
        status: true,
        message: "Data Transmisi",
        data: rows,
      });
    }
  });
});

// POST (STORE) a new transmisi record
router.post(
    "/store",
  [
    // Validation
    body("nama_transmisi").notEmpty(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        errors: errors.array(),
      });
    }

    const data = {
      nama_transmisi: req.body.nama_transmisi,
    };

    connection.query("INSERT INTO transmisi SET ?", data, (err, result) => {
      if (err) {
        return res.status(500).json({
          status: false,
          message: "Coba Lagi Dude.....",
        });
      } else {
        return res.status(201).json({
          status: true,
          message: "Berhasil Dude.....",
          data: {
            insertedId: result.insertId,
          },
        });
      }
    });
  }
);

// GET a specific transmisi record by ID
router.get("/:id", (req, res) => {
  const id = req.params.id;
  connection.query(
    "SELECT * FROM transmisi WHERE id_transmisi = ?",
    [id],
    (error, rows) => {
      if (error) {
        return res.status(500).json({
          status: false,
          message: "Server Error Dude.....",
          error: error,
        });
      }
      if (rows.length <= 0) {
        return res.status(404).json({
          status: false,
          message: "Coba Lagi Dude.....",
        });
      } else {
        return res.status(200).json({
          status: true,
          message: "Data Transmisi",
          data: rows[0],
        });
      }
    }
  );
});

// PATCH (UPDATE) a transmisi record by ID
router.patch(
  "/update/:id",
  [
    // Validation
    body("nama_transmisi").notEmpty(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        errors: errors.array(),
      });
    }

    const id = req.params.id;
    const data = {
      nama_transmisi: req.body.nama_transmisi,
    };

    connection.query(
      "UPDATE transmisi SET ? WHERE id_transmisi = ?",
      [data, id],
      (error, result) => {
        if (error) {
          return res.status(500).json({
            status: false,
            message: "Server Error Dude.....",
            error: error,
          });
        } else {
          return res.status(200).json({
            status: true,
            message: "Update Data Success Dude....",
          });
        }
      }
    );
  }
);

// DELETE a transmisi record by ID
router.delete("/delete/:id", (req, res) => {
  const id = req.params.id;
  connection.query(
    "DELETE FROM transmisi WHERE id_transmisi = ?",
    [id],
    (error, result) => {
      if (error) {
        return res.status(500).json({
          status: false,
          message: "Server Error Dude.....",
          error: error,
        });
      } else {
        return res.status(200).json({
          status: true,
          message: "Data Sudah Sukses Dihapus Dude....",
        });
      }
    }
  );
});

module.exports = router;
