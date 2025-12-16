import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

// =============================================
// MONGODB CONNECTION
// =============================================

const DATABASE_URL =
  process.env.DATABASE_URL ||
  "mongodb+srv://asifaowadud:sof6vxfRNfUEvdCg@cluster0.gjcwx8p.mongodb.net/jp-college-admission?retryWrites=true&w=majority&appName=Cluster0";
const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose
  .connect(DATABASE_URL)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// =============================================
// MONGOOSE SCHEMAS & MODELS
// =============================================

// User Schema
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: false },
    email: { type: String, required: true, unique: true },
    password: {
      type: String,
      required: function (this: any) {
        return this.authProvider === "email" || this.authProvider === "";
      },
    },
    phone: { type: String },
    address: { type: String },
    authProvider: {
      type: String,
      enum: ["email", "google", "facebook", "github"],
      default: "email",
    },
  },
  { timestamps: true }
);

// College Schema
const collegeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: { type: String, required: true },
    description: { type: String, required: true },
    rating: { type: Number, default: 0 },
    image: { type: String, default: "/placeholder.svg?height=400&width=600" },
    type: { type: String, default: "University" },
    established: { type: Number },
    affiliations: [{ type: String }],
    courses: [{ type: String }],
    facilities: [{ type: String }],
    tuitionFee: { type: Number, default: 0 },
    gallery: [{ type: String }],
  },
  { timestamps: true }
);

// Booking Schema
const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: true,
    },
    studentName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    course: { type: String, required: true },
    previousEducation: { type: String, required: true },
    grade: { type: String, required: true },
    address: { type: String, required: true },
    guardianName: { type: String },
    guardianPhone: { type: String },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// Review Schema
const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: true,
    },
    userName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

// Models
const User = mongoose.model("User", userSchema);
const College = mongoose.model("College", collegeSchema);
const Booking = mongoose.model("Booking", bookingSchema);
const Review = mongoose.model("Review", reviewSchema);

// =============================================
// INTERFACES
// =============================================

interface AuthRequest extends Request {
  userId?: string;
}

// =============================================
// MIDDLEWARE
// =============================================

const app = express();
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);
app.use(express.json());

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Authentication middleware
const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "Access token required" });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) {
      res.status(403).json({ error: "Invalid or expired token" });
      return;
    }
    req.userId = decoded.userId;
    next();
  });
};

// =============================================
// SEED DATA FUNCTION
// =============================================

const seedDatabase = async (): Promise<void> => {
  try {
    // Check if data already exists
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log("Database already seeded");
      return;
    }

    console.log("Seeding database...");

    // Create demo user
    const hashedPassword = await bcrypt.hash("password", 10);
    const demoUser = await User.create({
      name: "Demo User",
      email: "demo@example.com",
      password: hashedPassword,
      phone: "+1234567890",
      address: "123 Demo Street, Demo City",
    });

    // Create colleges
    const colleges = await College.insertMany([
      {
        name: "Stanford University",
        location: "Stanford, California",
        description:
          "A leading research university with seven schools, Stanford offers a comprehensive education in humanities, sciences, engineering, and more.",
        rating: 4.8,
        image: "/stanford-university-campus.png",
        type: "Private University",
        established: 1885,
        affiliations: ["AAU", "APRU", "Pac-12"],
        courses: [
          "Computer Science",
          "Engineering",
          "Business",
          "Medicine",
          "Law",
        ],
        facilities: [
          "Library",
          "Labs",
          "Sports Complex",
          "Cafeteria",
          "Auditorium",
        ],
        tuitionFee: 55000,
        gallery: [
          "/stanford-university-campus.png",
          "/university-library-interior.png",
          "/university-sports-complex.jpg",
          "/university-lab.jpg",
        ],
      },
      {
        name: "MIT",
        location: "Cambridge, Massachusetts",
        description:
          "Massachusetts Institute of Technology is a world-renowned institution focused on science, technology, and innovation.",
        rating: 4.9,
        image: "/mit-campus.png",
        type: "Private University",
        established: 1861,
        affiliations: ["AAU", "APRU", "COFHE"],
        courses: [
          "Engineering",
          "Computer Science",
          "Physics",
          "Mathematics",
          "Economics",
        ],
        facilities: [
          "Research Labs",
          "Library",
          "Sports Center",
          "Student Center",
          "Maker Spaces",
        ],
        tuitionFee: 53000,
        gallery: [
          "/mit-campus.png",
          "/university-lab.jpg",
          "/university-library-interior.png",
        ],
      },
      {
        name: "Harvard University",
        location: "Cambridge, Massachusetts",
        description:
          "Harvard is the oldest institution of higher learning in the United States, offering unparalleled education and research opportunities.",
        rating: 4.9,
        image: "/harvard-campus.png",
        type: "Private University",
        established: 1636,
        affiliations: ["AAU", "COFHE", "Ivy League"],
        courses: [
          "Law",
          "Medicine",
          "Business",
          "Arts & Sciences",
          "Engineering",
        ],
        facilities: [
          "Libraries",
          "Museums",
          "Research Centers",
          "Athletic Facilities",
          "Student Housing",
        ],
        tuitionFee: 54000,
        gallery: [
          "/harvard-campus.png",
          "/university-library-interior.png",
          "/university-sports-complex.jpg",
        ],
      },
      {
        name: "Oxford University",
        location: "Oxford, United Kingdom",
        description:
          "The University of Oxford is the oldest university in the English-speaking world with a distinguished history of scholarship.",
        rating: 4.8,
        image: "/oxford-campus.png",
        type: "Public University",
        established: 1096,
        affiliations: ["Russell Group", "European University Association"],
        courses: ["Philosophy", "History", "Law", "Medicine", "Sciences"],
        facilities: [
          "Historic Libraries",
          "Museums",
          "Research Labs",
          "Sports Facilities",
          "Theaters",
        ],
        tuitionFee: 45000,
        gallery: ["/oxford-campus.png", "/university-library-interior.png"],
      },
      {
        name: "Cambridge University",
        location: "Cambridge, United Kingdom",
        description:
          "University of Cambridge is one of the world's oldest and most prestigious universities, known for academic excellence.",
        rating: 4.9,
        image: "/cambridge-campus.png",
        type: "Public University",
        established: 1209,
        affiliations: ["Russell Group", "The Golden Triangle"],
        courses: [
          "Mathematics",
          "Natural Sciences",
          "Engineering",
          "Medicine",
          "Law",
        ],
        facilities: [
          "College Libraries",
          "Research Labs",
          "Sports Grounds",
          "Museums",
          "Concert Halls",
        ],
        tuitionFee: 46000,
        gallery: [
          "/cambridge-campus.png",
          "/university-library-interior.png",
          "/university-lab.jpg",
        ],
      },
      {
        name: "UC Berkeley",
        location: "Berkeley, California",
        description:
          "The University of California, Berkeley is a leading public research university with a distinguished faculty and innovative programs.",
        rating: 4.7,
        image: "/berkeley-campus.png",
        type: "Public University",
        established: 1868,
        affiliations: ["AAU", "Pac-12", "UC System"],
        courses: [
          "Computer Science",
          "Engineering",
          "Business",
          "Social Sciences",
          "Natural Sciences",
        ],
        facilities: [
          "Research Centers",
          "Libraries",
          "Athletic Facilities",
          "Student Union",
          "Performance Venues",
        ],
        tuitionFee: 42000,
        gallery: [
          "/berkeley-campus.png",
          "/university-sports-complex.jpg",
          "/university-library-interior.png",
        ],
      },
    ]);

    // Create a sample review
    await Review.create({
      userId: demoUser._id,
      collegeId: colleges[0]._id,
      userName: "Demo User",
      rating: 5,
      comment: "Excellent university with world-class facilities and faculty!",
    });

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
};

// =============================================
// AUTHENTICATION ROUTES
// =============================================

// Register new user
app.post(
  "/api/auth/register",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, email, password, phone, address } = req.body;

      if (!name || !email || !password) {
        res
          .status(400)
          .json({ error: "Name, email, and password are required" });
        return;
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.status(400).json({ error: "User with this email already exists" });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await User.create({
        name,
        email,
        password: hashedPassword,
        phone,
        address,
      });

      const token = jwt.sign({ userId: newUser._id }, JWT_SECRET, {
        expiresIn: "7d",
      });

      res.status(201).json({
        message: "User registered successfully",
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          address: newUser.address,
        },
        token,
      });
    } catch (error) {
      console.error("Register error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Login user
app.post(
  "/api/auth/login",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: "Email and password are required" });
        return;
      }

      const user = await User.findOne({ email });
      if (!user) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password!);
      if (!isPasswordValid) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }

      const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
        expiresIn: "7d",
      });

      res.json({
        message: "Login successful",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.address,
        },
        token,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// google login

// creating access token from ACCESS_TOKEN_SECRET
app.post("/api/auth/google-login", async (req, res) => {
  const { email, authProvider, name } = req.body;
  let isExistUserByEmail = await User.findOne({ email });
  if (!isExistUserByEmail) {
    isExistUserByEmail = await User.create({
      email,
      authProvider,
      name,
    });
  }

  const token = jwt.sign({ userId: isExistUserByEmail._id }, JWT_SECRET, {
    expiresIn: "7d",
  });

  res.send({ user: isExistUserByEmail, token });
});

// Get current user
app.get(
  "/api/auth/me",
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const user = await User.findById(req.userId).select("-password");
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      res.json(user);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Update user profile
app.put(
  "/api/auth/profile",
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { name, phone, address, currentPassword, newPassword } = req.body;

      const user = await User.findById(req.userId);
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      if (name) user.name = name;
      if (phone) user.phone = phone;
      if (address) user.address = address;

      if (currentPassword && newPassword) {
        const isPasswordValid = await bcrypt.compare(
          currentPassword,
          user.password!
        );
        if (!isPasswordValid) {
          res.status(401).json({ error: "Current password is incorrect" });
          return;
        }
        user.password = await bcrypt.hash(newPassword, 10);
      }

      await user.save();

      res.json({
        message: "Profile updated successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.address,
        },
      });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// =============================================
// COLLEGE ROUTES
// =============================================

// Get all colleges with search and filters
app.get("/api/colleges", async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, type, minRating, sortBy } = req.query;

    const query: any = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
    }

    if (type) {
      query.type = type;
    }

    if (minRating) {
      query.rating = { $gte: Number.parseFloat(minRating as string) };
    }

    const sort: any = {};
    if (sortBy === "rating") {
      sort.rating = -1;
    } else if (sortBy === "name") {
      sort.name = 1;
    } else if (sortBy === "tuition") {
      sort.tuitionFee = 1;
    }

    const colleges = await College.find(query).sort(sort);
    res.json(colleges);
  } catch (error) {
    console.error("Get colleges error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get single college by ID
app.get(
  "/api/colleges/:id",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ error: "Invalid college ID" });
        return;
      }

      const college = await College.findById(id);
      if (!college) {
        res.status(404).json({ error: "College not found" });
        return;
      }

      const reviews = await Review.find({ collegeId: id });

      res.json({
        ...college.toObject(),
        reviews,
      });
    } catch (error) {
      console.error("Get college error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Create new college
app.post(
  "/api/colleges",
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const {
        name,
        location,
        description,
        rating,
        image,
        type,
        established,
        affiliations,
        courses,
        facilities,
        tuitionFee,
        gallery,
      } = req.body;

      if (!name || !location || !description) {
        res
          .status(400)
          .json({ error: "Name, location, and description are required" });
        return;
      }

      const newCollege = await College.create({
        name,
        location,
        description,
        rating: rating || 0,
        image: image || "/placeholder.svg?height=400&width=600",
        type: type || "University",
        established: established || new Date().getFullYear(),
        affiliations: affiliations || [],
        courses: courses || [],
        facilities: facilities || [],
        tuitionFee: tuitionFee || 0,
        gallery: gallery || [],
      });

      res.status(201).json({
        message: "College created successfully",
        college: newCollege,
      });
    } catch (error) {
      console.error("Create college error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Update college
app.put(
  "/api/colleges/:id",
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ error: "Invalid college ID" });
        return;
      }

      const updatedCollege = await College.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
      });

      if (!updatedCollege) {
        res.status(404).json({ error: "College not found" });
        return;
      }

      res.json({
        message: "College updated successfully",
        college: updatedCollege,
      });
    } catch (error) {
      console.error("Update college error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Delete college
app.delete(
  "/api/colleges/:id",
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ error: "Invalid college ID" });
        return;
      }

      const deletedCollege = await College.findByIdAndDelete(id);
      if (!deletedCollege) {
        res.status(404).json({ error: "College not found" });
        return;
      }

      // Delete related bookings and reviews
      await Booking.deleteMany({ collegeId: id });
      await Review.deleteMany({ collegeId: id });

      res.json({ message: "College deleted successfully" });
    } catch (error) {
      console.error("Delete college error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// =============================================
// BOOKING ROUTES
// =============================================

// Get all bookings for current user
app.get(
  "/api/bookings",
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const bookings = await Booking.find({ userId: req.userId }).populate(
        "collegeId"
      );
      res.json(bookings);
    } catch (error) {
      console.error("Get bookings error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Get single booking
app.get(
  "/api/bookings/:id",
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ error: "Invalid booking ID" });
        return;
      }

      const booking = await Booking.findOne({
        _id: id,
        userId: req.userId,
      }).populate("collegeId");
      if (!booking) {
        res.status(404).json({ error: "Booking not found" });
        return;
      }

      res.json(booking);
    } catch (error) {
      console.error("Get booking error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Create new booking
app.post(
  "/api/bookings",
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const {
        collegeId,
        studentName,
        email,
        phone,
        course,
        previousEducation,
        grade,
        address,
        guardianName,
        guardianPhone,
      } = req.body;

      if (
        !collegeId ||
        !studentName ||
        !email ||
        !phone ||
        !course ||
        !previousEducation ||
        !grade ||
        !address
      ) {
        res.status(400).json({ error: "All required fields must be provided" });
        return;
      }

      if (!mongoose.Types.ObjectId.isValid(collegeId)) {
        res.status(400).json({ error: "Invalid college ID" });
        return;
      }

      const college = await College.findById(collegeId);
      if (!college) {
        res.status(404).json({ error: "College not found" });
        return;
      }

      const newBooking = await Booking.create({
        userId: req.userId,
        collegeId,
        studentName,
        email,
        phone,
        course,
        previousEducation,
        grade,
        address,
        guardianName,
        guardianPhone,
        status: "pending",
      });

      const populatedBooking = await Booking.findById(newBooking._id).populate(
        "collegeId"
      );

      res.status(201).json({
        message: "Booking created successfully",
        booking: populatedBooking,
      });
    } catch (error) {
      console.error("Create booking error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Update booking status
app.put(
  "/api/bookings/:id",
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ error: "Invalid booking ID" });
        return;
      }

      if (status && !["pending", "approved", "rejected"].includes(status)) {
        res.status(400).json({ error: "Invalid status value" });
        return;
      }

      const updatedBooking = await Booking.findOneAndUpdate(
        { _id: id, userId: req.userId },
        req.body,
        {
          new: true,
          runValidators: true,
        }
      ).populate("collegeId");

      if (!updatedBooking) {
        res.status(404).json({ error: "Booking not found" });
        return;
      }

      res.json({
        message: "Booking updated successfully",
        booking: updatedBooking,
      });
    } catch (error) {
      console.error("Update booking error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Delete booking
app.delete(
  "/api/bookings/:id",
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ error: "Invalid booking ID" });
        return;
      }

      const deletedBooking = await Booking.findOneAndDelete({
        _id: id,
        userId: req.userId,
      });
      if (!deletedBooking) {
        res.status(404).json({ error: "Booking not found" });
        return;
      }

      res.json({ message: "Booking deleted successfully" });
    } catch (error) {
      console.error("Delete booking error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// =============================================
// REVIEW ROUTES
// =============================================

// Get all reviews for a college
app.get(
  "/api/reviews/college/:collegeId",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { collegeId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(collegeId)) {
        res.status(400).json({ error: "Invalid college ID" });
        return;
      }

      const reviews = await Review.find({ collegeId }).sort({ createdAt: -1 });
      res.json(reviews);
    } catch (error) {
      console.error("Get reviews error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Get all reviews by current user
app.get(
  "/api/reviews/user",
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const reviews = await Review.find({ userId: req.userId })
        .populate("collegeId")
        .sort({ createdAt: -1 });
      res.json(reviews);
    } catch (error) {
      console.error("Get user reviews error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Create new review
app.post(
  "/api/reviews",
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { collegeId, rating, comment } = req.body;

      if (!collegeId || !rating || !comment) {
        res
          .status(400)
          .json({ error: "College ID, rating, and comment are required" });
        return;
      }

      if (!mongoose.Types.ObjectId.isValid(collegeId)) {
        res.status(400).json({ error: "Invalid college ID" });
        return;
      }

      if (rating < 1 || rating > 5) {
        res.status(400).json({ error: "Rating must be between 1 and 5" });
        return;
      }

      const college = await College.findById(collegeId);
      if (!college) {
        res.status(404).json({ error: "College not found" });
        return;
      }

      const user = await User.findById(req.userId);
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      // Check if user already reviewed this college
      const existingReview = await Review.findOne({
        userId: req.userId,
        collegeId,
      });
      if (existingReview) {
        res
          .status(400)
          .json({ error: "You have already reviewed this college" });
        return;
      }

      const newReview = await Review.create({
        userId: req.userId,
        collegeId,
        userName: user.name,
        rating,
        comment,
      });

      // Update college rating
      const allReviews = await Review.find({ collegeId });
      const averageRating =
        allReviews.reduce((sum, review) => sum + review.rating, 0) /
        allReviews.length;
      college.rating = Math.round(averageRating * 10) / 10;
      await college.save();

      res.status(201).json({
        message: "Review created successfully",
        review: newReview,
      });
    } catch (error) {
      console.error("Create review error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Update review
app.put(
  "/api/reviews/:id",
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { rating, comment } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ error: "Invalid review ID" });
        return;
      }

      if (rating && (rating < 1 || rating > 5)) {
        res.status(400).json({ error: "Rating must be between 1 and 5" });
        return;
      }

      const review = await Review.findOne({ _id: id, userId: req.userId });
      if (!review) {
        res.status(404).json({ error: "Review not found" });
        return;
      }

      if (rating) review.rating = rating;
      if (comment) review.comment = comment;
      await review.save();

      // Update college rating
      const allReviews = await Review.find({ collegeId: review.collegeId });
      const averageRating =
        allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      await College.findByIdAndUpdate(review.collegeId, {
        rating: Math.round(averageRating * 10) / 10,
      });

      res.json({
        message: "Review updated successfully",
        review,
      });
    } catch (error) {
      console.error("Update review error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Delete review
app.delete(
  "/api/reviews/:id",
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ error: "Invalid review ID" });
        return;
      }

      const review = await Review.findOne({ _id: id, userId: req.userId });
      if (!review) {
        res.status(404).json({ error: "Review not found" });
        return;
      }

      const collegeId = review.collegeId;
      await Review.findByIdAndDelete(id);

      // Update college rating
      const allReviews = await Review.find({ collegeId });
      if (allReviews.length > 0) {
        const averageRating =
          allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
        await College.findByIdAndUpdate(collegeId, {
          rating: Math.round(averageRating * 10) / 10,
        });
      } else {
        await College.findByIdAndUpdate(collegeId, { rating: 0 });
      }

      res.json({ message: "Review deleted successfully" });
    } catch (error) {
      console.error("Delete review error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// =============================================
// ADMIN ROUTES (Get all bookings)
// =============================================

// Get all bookings (admin only - simplified for demo)
app.get(
  "/api/admin/bookings",
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const bookings = await Booking.find()
        .populate("userId collegeId")
        .sort({ createdAt: -1 });
      res.json(bookings);
    } catch (error) {
      console.error("Get all bookings error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Update any booking status (admin only)
app.put(
  "/api/admin/bookings/:id",
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ error: "Invalid booking ID" });
        return;
      }

      if (status && !["pending", "approved", "rejected"].includes(status)) {
        res.status(400).json({ error: "Invalid status value" });
        return;
      }

      const updatedBooking = await Booking.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      ).populate("userId collegeId");

      if (!updatedBooking) {
        res.status(404).json({ error: "Booking not found" });
        return;
      }

      res.json({
        message: "Booking status updated successfully",
        booking: updatedBooking,
      });
    } catch (error) {
      console.error("Update booking status error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// =============================================
// HEALTH CHECK & ROOT ROUTE
// =============================================

app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "College Booking Platform API",
    version: "1.0.0",
    status: "running",
    endpoints: {
      auth: {
        register: "POST /api/auth/register",
        login: "POST /api/auth/login",
        getProfile: "GET /api/auth/me",
        updateProfile: "PUT /api/auth/profile",
      },
      colleges: {
        getAll: "GET /api/colleges",
        getOne: "GET /api/colleges/:id",
        create: "POST /api/colleges",
        update: "PUT /api/colleges/:id",
        delete: "DELETE /api/colleges/:id",
      },
      bookings: {
        getAll: "GET /api/bookings",
        getOne: "GET /api/bookings/:id",
        create: "POST /api/bookings",
        update: "PUT /api/bookings/:id",
        delete: "DELETE /api/bookings/:id",
      },
      reviews: {
        getByCollege: "GET /api/reviews/college/:collegeId",
        getByUser: "GET /api/reviews/user",
        create: "POST /api/reviews",
        update: "PUT /api/reviews/:id",
        delete: "DELETE /api/reviews/:id",
      },
      admin: {
        getAllBookings: "GET /api/admin/bookings",
        updateBookingStatus: "PUT /api/admin/bookings/:id",
      },
    },
  });
});

app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// =============================================
// START SERVER
// =============================================

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Demo account: demo@example.com / password`);

  // Seed database after a short delay to ensure connection is established
  setTimeout(() => {
    seedDatabase();
  }, 2000);
});
