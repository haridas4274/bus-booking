const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");
const { default: axios } = require("axios");

const app = express();
const port = 3000;
const accessToken ="no token here";
let myToken = "Haridas@123";
// Middleware
app.use(cors());
app.use(bodyParser.json());


// Database Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "whatspp-bus-ticke-flow",
});

// Connect to the Database
db.connect((err) => {
  if (err) throw err;
  console.log("Connected to MySQL Database");
});

//init function
app.get("/webhook", (req, res) => {
    
  let mode = req.query["hub.mode"];
  let challenge = req.query["hub.challenge"];
  let token = req.query["hub.verify_token"];

  if (challenge == "subscribe" && token == myToken) {
    const initialResponse = {
        type: "interactive",
        header: {
          type: "text",
          text: "Bus Ticket Booking",
        },
        body: {
          text: "Please select one option",
        },
        action: {
          buttons: [
            { type: "reply", reply: { id: "booking", title: "Booking"} },
            {
              type: "reply",
              reply: { id: "cancel_booking", title: "Cancel Booking"},
            },
            {
              type: "reply",
              reply: { id: "booking_details", title: "Booking Details"},
            },
          ],
        },
      };
    res.status(200).json(initialResponse);
  } else {
    res.status(403).send('wrong routing');
  }
});
app.post("/webhook", (req, res) => {
  // https://jsoneditoronline.org/#left=cloud.549a04177e9c423ebc287d02306e4f31
  var requestedUseriId =req.body.__usid; 
  let body_params = req.body;

  if (body_params.object) {
    if (
      body_params.entry[0].changes &&
      body_params.entry[0].changes[0].value.messages &&
      body_params.entry[0].changes[0].value.messages[0]
    ) {
      let phoneNoId =
        body_params.entry[0].changes[0].value.metadata.phone_number_id;
      let from = body_params.entry[0].changes[0].value.messages.from;
      let msg_body = body_params.entry[0].changes[0].value.messages.text.body;

      axios({
        method: "POST",
        url: `https://graph.facebook.com/v20.0/${phoneNoId}/messages?access_token=${accessToken}`,
        data: {
          messaging_product: "whatsapp",
          preview_url: false,
          recipient_type: "individual",
          to: from,
          text: {
            body:"I'm Haridas" //in production need to show 
          },
        },
        headers:{
            "Content-Type":"application/json"
        },
      });

      res.sendStatus(200);
    }else{
        res.sendStatus(404);
    }
  }
});



// Step 2: Travel Details 
app.get("/webhook/travel-details", (req, res) => {
  const travelDetailsResponse = {
    type: "form",
    header: {
      type: "text",
      text: "Please fill in your travel details",
    },
    body: {
      text: "Select your Travel Date, Boarding Point, and Dropping Point",
    },
    fields: [
      { id: "travelDate", label: "Travel Date", type: "datepicker" },
      {
        id: "boardingPoint",
        label: "Boarding Point",
        type: "dropdown",
        options: [],
      },
      {
        id: "droppingPoint",
        label: "Dropping Point",
        type: "dropdown",
        options: [],
      },
    ],
  };

  // Fetch Boarding Points
  db.query(
    "SELECT id, location_name FROM boarding_points",
    (err, boardingPoints) => {
      if (err) return res.status(500).send(err);
      travelDetailsResponse.fields[1].options = boardingPoints;

      // Fetch Dropping Points
      db.query(
        "SELECT id, location_name FROM dropping_points",
        (err, droppingPoints) => {
          if (err) return res.status(500).send(err);
          travelDetailsResponse.fields[2].options = droppingPoints;

          res.json(travelDetailsResponse);
        }
      );
    }
  );
});

// Step 3: Available Buses
app.post("/webhook/buses", (req, res) => {
  const { boardingPointId, droppingPointId } = req.body;

  db.query(
    "SELECT * FROM buses WHERE boarding_point_id = ? AND dropping_point_id = ?",
    [boardingPointId, droppingPointId],
    (err, buses) => {
      if (err) return res.status(500).send(err);

      const busListResponse = {
        type: "list",
        header: {
          type: "text",
          text: "Available Buses",
        },
        body: {
          text: "Please select a bus from the list",
        },
        action: {
          sections: [
            {
              title: "Buses",
              rows: buses.map((bus) => ({
                id: `bus_${bus.id}`,
                title: `${bus.bus_name} - ${bus.departure_time}`,
                description: `Seats: ${bus.available_seats}, Price: $${bus.price}`,
              })),
            },
          ],
        },
      };
      res.json(busListResponse);
    }
  );
});

// Step 4: Seat Selection
app.post("/webhook/bus-layout", (req, res) => {
  const { busId } = req.body;

  db.query(
    "SELECT seat_layout FROM buses WHERE id = ?",
    [busId],
    (err, [bus]) => {
      if (err) return res.status(500).send(err);

      if (typeof bus.seat_layout == "object") {
        var layout = bus.seat_layout;
      } else {
        var layout = JSON.parse(bus.seat_layout);
      }
      const seatSelectionResponse = {
        type: "list",
        header: {
          type: "text",
          text: "Select Your Seat",
        },
        body: {
          text: "Please select available seats",
        },
        action: {
          sections: [
            {
              title: "Seats",
              rows: [],
            },
          ],
        },
      };

      for (let row = 1; row <= layout.rows; row++) {
        for (let seat = 1; seat <= layout.seats_per_row; seat++) {
          seatSelectionResponse.action.sections[0].rows.push({
            id: `seat_${row}_${seat}`,
            title: `Row ${row} - Seat ${seat}`,
          });
        }
      }

      res.json(seatSelectionResponse);
    }
  );
});

// Step 5: User Details
app.post("/webhook/user-details", (req, res) => {
  const userDetailsResponse = {
    type: "form",
    header: {
      type: "text",
      text: "Passenger Details",
    },
    body: {
      text: "Please fill in your details",
    },
    fields: [
      { id: "name", label: "Full Name", type: "text" },
      { id: "Gender", label: "Gender", type: "dropdown" },
      { id: "contact", label: "Contact Number", type: "phone_number" },
    ],
  };
  res.json(userDetailsResponse);
});

// Step 6: Confirm Booking and Generate QR Code (future)
app.post("/webhook/confirm-booking", (req, res) => {
  const { busId, seatNumber, userName, userContact } = req.body;

  db.query(
    "INSERT INTO bookings (bus_id, seat_number, user_name, user_contact) VALUES (?, ?, ?, ?)",
    [busId, seatNumber, userName, userContact],
    (err) => {
      if (err) return res.status(500).send(err);

      // Decrease available seats
      db.query(
        "UPDATE buses SET available_seats = available_seats - 1 WHERE id = ?",
        [busId],
        (err) => {
          if (err) return res.status(500).send(err);

          // Generate a sample QR code URL (replace with actual QR code generation logic)
          const qrCodeUrl = "https://example.com/qr-code.png";
          const confirmationResponse = {
            type: "media",
            header: {
              type: "text",
              text: "Your Booking is Confirmed",
            },
            body: {
              text: "Your ticket has been booked successfully. Scan the QR code below at the boarding point.",
            },
            media: {
              type: "image",
              url: qrCodeUrl,
            },
          };
          res.json(confirmationResponse);
        }
      );
    }
  );
});

// Start the Server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
