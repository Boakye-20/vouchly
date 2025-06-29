import Link from "next/link";
import { VouchlyLogo } from "@/components/icons";
import { Menu, CheckCircle, XCircle, Check, Video, Shield, LineChart, Filter, Bell, Users, Star } from "lucide-react";

export default function Home() {
  return (
    <div className="bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-4">
                  <Link href="/" className="flex items-center space-x-2">
                      <VouchlyLogo className="h-8 w-8 text-primary" />
                      <h1 className="text-2xl font-bold font-headline text-gray-800">Vouchly</h1>
                  </Link>
                  <div className="hidden md:flex items-center space-x-8">
                      <a href="#how-it-works" className="text-gray-600 hover:text-gray-900">How it Works</a>
                      <a href="#features" className="text-gray-600 hover:text-gray-900">Features</a>
                      <a href="#testimonials" className="text-gray-600 hover:text-gray-900">Success Stories</a>
                      <a href="#pricing" className="text-gray-600 hover:text-gray-900">Pricing</a>
                      <Link href="/dashboard" className="px-4 py-2 text-primary hover:text-primary/80 font-medium">Log In</Link>
                      <Link href="/dashboard" className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium">
                          Get Started Free
                      </Link>
                  </div>
                  <button className="md:hidden">
                      <Menu className="text-gray-600" />
                  </button>
              </div>
          </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <div>
                      <div className="flex items-center space-x-2 mb-4">
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                              🎉 100% Free for UK University Students
                          </span>
                      </div>
                      <h1 className="text-5xl font-bold text-gray-900 mb-6 font-headline">
                          Find Study Partners Who <span className="gradient-text">Actually Show Up</span>
                      </h1>
                      <p className="text-xl text-gray-700 mb-8 font-body">
                          Join thousands of UK uni students using our Vouch Score system to find reliable, 
                          committed study partners for focused co-studying sessions. No more no-shows, 
                          just productive accountability.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4 mb-8">
                          <Link href="/dashboard" className="px-8 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium text-lg shadow-lg hover:shadow-xl transition-all">
                              Start Free with Uni Email →
                          </Link>
                          <a href="#how-it-works" className="px-8 py-4 bg-white text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-lg shadow-lg hover:shadow-xl transition-all">
                              Watch How It Works (2 min)
                          </a>
                      </div>
                      <div className="flex items-center space-x-6 text-sm text-gray-600">
                          <div className="flex items-center">
                              <CheckCircle className="text-green-500 mr-2 h-4 w-4" />
                              No credit card required
                          </div>
                          <div className="flex items-center">
                              <CheckCircle className="text-green-500 mr-2 h-4 w-4" />
                              3 min setup
                          </div>
                          <div className="flex items-center">
                              <CheckCircle className="text-green-500 mr-2 h-4 w-4" />
                              Verified .ac.uk only
                          </div>
                      </div>
                  </div>
                  <div className="relative">
                      <div className="bg-white rounded-2xl shadow-2xl p-6 animate-float">
                          <div className="flex items-center justify-between mb-4">
                              <h3 className="font-semibold">Live Study Sessions</h3>
                              <span className="text-green-500 text-sm flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></span> 247 Active Now</span>
                          </div>
                          <div className="space-y-3">
                              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                                      ET
                                  </div>
                                  <div className="flex-1">
                                      <p className="font-medium">Emma & James</p>
                                      <p className="text-sm text-gray-600">EU Politics Review • 47 min</p>
                                  </div>
                                  <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                      In Progress
                                  </div>
                              </div>
                              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                                      SP
                                  </div>
                                  <div className="flex-1">
                                      <p className="font-medium">Sarah & Alex</p>
                                      <p className="text-sm text-gray-600">Calculus Problem Set • Starting</p>
                                  </div>
                                  <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                      Joining
                                  </div>
                              </div>
                              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg opacity-75">
                                  <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold">
                                      MJ
                                  </div>
                                  <div className="flex-1">
                                      <p className="font-medium">Maya & Tom</p>
                                      <p className="text-sm text-gray-600">Essay Writing • Completed</p>
                                  </div>
                                  <div className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                      +2 pts each
                                  </div>
                              </div>
                          </div>
                      </div>
                      <div className="absolute -bottom-4 -right-4 bg-yellow-100 rounded-lg p-4 shadow-lg animate-pulse">
                          <p className="text-sm font-medium">🏆 Today's Top Voucher</p>
                          <p className="text-xs text-gray-600">Sophie C. • 98% Score • 23 sessions</p>
                      </div>
                  </div>
              </div>
          </div>
      </section>

      {/* Social Proof Bar */}
      <section className="bg-white py-8 border-y">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                  <div>
                      <div className="text-3xl font-bold text-primary">12,847</div>
                      <div className="text-sm text-gray-600">Active UK Students</div>
                  </div>
                  <div>
                      <div className="text-3xl font-bold text-green-600">94%</div>
                      <div className="text-sm text-gray-600">Show-Up Rate</div>
                  </div>
                  <div>
                      <div className="text-3xl font-bold text-purple-600">4.8/5</div>
                      <div className="text-sm text-gray-600">Student Rating</div>
                  </div>
                  <div>
                      <div className="text-3xl font-bold text-orange-600">68</div>
                      <div className="text-sm text-gray-600">UK Universities</div>
                  </div>
              </div>
          </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold mb-4 font-headline">The Study Partner Problem We All Know</h2>
                  <p className="text-xl text-gray-600 font-body">Sound familiar?</p>
              </div>
              <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                          <XCircle className="text-red-500 mt-1 h-5 w-5 flex-shrink-0" />
                          <p className="text-gray-700">"Let's study together!" ...but they never show up</p>
                      </div>
                      <div className="flex items-start space-x-3">
                          <XCircle className="text-red-500 mt-1 h-5 w-5 flex-shrink-0" />
                          <p className="text-gray-700">Library study groups turn into 2-hour chat sessions</p>
                      </div>
                      <div className="flex items-start space-x-3">
                          <XCircle className="text-red-500 mt-1 h-5 w-5 flex-shrink-0" />
                          <p className="text-gray-700">Discord servers full of distractions, no accountability</p>
                      </div>
                      <div className="flex items-start space-x-3">
                          <XCircle className="text-red-500 mt-1 h-5 w-5 flex-shrink-0" />
                          <p className="text-gray-700">Random online partners who disappear mid-session</p>
                      </div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
                      <h3 className="text-2xl font-bold mb-4 font-headline">Enter: The Vouch Score System</h3>
                      <p className="mb-6 font-body">
                          Our unique accountability system ensures you're matched with students who 
                          take their commitments seriously. Just like you.
                      </p>
                      <ul className="space-y-3">
                          <li className="flex items-center">
                              <Check className="mr-3 h-5 w-5" />
                              Start at 80 points, earn more by showing up
                          </li>
                          <li className="flex items-center">
                              <Check className="mr-3 h-5 w-5" />
                              Lose points for no-shows or late cancellations
                          </li>
                          <li className="flex items-center">
                              <Check className="mr-3 h-5 w-5" />
                              Match with partners at similar commitment levels
                          </li>
                      </ul>
                  </div>
              </div>
          </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-gray-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold mb-4 font-headline">How Vouchly Works</h2>
                  <p className="text-xl text-gray-600 font-body">Get matched and studying in under 3 minutes</p>
              </div>
              <div className="grid md:grid-cols-4 gap-8">
                  <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <span className="text-2xl font-bold text-primary">1</span>
                      </div>
                      <h3 className="font-semibold mb-2">Sign Up with Uni Email</h3>
                      <p className="text-sm text-gray-600">Instant verification with your .ac.uk email. Set your schedule and study preferences.</p>
                  </div>
                  <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <span className="text-2xl font-bold text-primary">2</span>
                      </div>
                      <h3 className="font-semibold mb-2">Get Matched by Algorithm</h3>
                      <p className="text-sm text-gray-600">Our smart matching considers schedule, reliability score, and study style.</p>
                  </div>
                  <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <span className="text-2xl font-bold text-primary">3</span>
                      </div>
                      <h3 className="font-semibold mb-2">Confirm & Start Session</h3>
                      <p className="text-sm text-gray-600">Both partners confirm start within 15 mins. Built-in video, no links needed.</p>
                  </div>
                  <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <span className="text-2xl font-bold text-primary">4</span>
                      </div>
                      <h3 className="font-semibold mb-2">Complete & Build Score</h3>
                      <p className="text-sm text-gray-600">Finish your session, earn +2 Vouch points. Build your reputation!</p>
                  </div>
              </div>
              <div className="text-center mt-12">
                  <a href="#how-it-works" className="px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium">
                      See Video Demo →
                  </a>
              </div>
          </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold mb-4 font-headline">Everything You Need for Productive Study Sessions</h2>
                  <p className="text-xl text-gray-600 font-body">Designed by students, for students</p>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                  <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                          <Video className="text-blue-600 h-6 w-6" />
                      </div>
                      <h3 className="text-xl font-semibold mb-3">Built-in Video Sessions</h3>
                      <p className="text-gray-600 mb-4">No more "send me the link" messages. Click join and you're in. Camera preferences respected.</p>
                      <a href="#" className="text-primary hover:text-primary/80 font-medium">Learn more →</a>
                  </div>
                  <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                          <Shield className="text-purple-600 h-6 w-6" />
                      </div>
                      <h3 className="text-xl font-semibold mb-3">4-Hour Lock Rule</h3>
                      <p className="text-gray-600 mb-4">Sessions lock 4 hours before start. Reschedule early or commit. No last-minute flaking.</p>
                      <a href="#" className="text-primary hover:text-primary/80 font-medium">Learn more →</a>
                  </div>
                  <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                          <LineChart className="text-green-600 h-6 w-6" />
                      </div>
                      <h3 className="text-xl font-semibold mb-3">Progress Tracking</h3>
                      <p className="text-gray-600 mb-4">See your study streaks, weekly goals, and Vouch Score history. Stay motivated!</p>
                      <a href="#" className="text-primary hover:text-primary/80 font-medium">Learn more →</a>
                  </div>
                  <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                      <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                          <Filter className="text-yellow-600 h-6 w-6" />
                      </div>
                      <h3 className="text-xl font-semibold mb-3">Smart Filtering</h3>
                      <p className="text-gray-600 mb-4">Filter by uni, subject, year, Vouch Score, study style. Find your perfect match.</p>
                      <a href="#" className="text-primary hover:text-primary/80 font-medium">Learn more →</a>
                  </div>
                  <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                      <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                          <Bell className="text-red-600 h-6 w-6" />
                      </div>
                      <h3 className="text-xl font-semibold mb-3">Smart Reminders</h3>
                      <p className="text-gray-600 mb-4">Calendar sync, 10-min warnings, completion prompts. Never miss a session.</p>
                      <a href="#" className="text-primary hover:text-primary/80 font-medium">Learn more →</a>
                  </div>
                  <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                      <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                          <Users className="text-indigo-600 h-6 w-6" />
                      </div>
                      <h3 className="text-xl font-semibold mb-3">Study Styles</h3>
                      <p className="text-gray-600 mb-4">Silent focus, quiet co-working, or motivational. Match your vibe.</p>
                      <a href="#" className="text-primary hover:text-primary/80 font-medium">Learn more →</a>
                  </div>
              </div>
          </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="bg-gradient-to-br from-blue-50 to-purple-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold mb-4 font-headline">What UK Students Are Saying</h2>
                  <p className="text-xl text-gray-600 font-body">Join thousands who've transformed their study habits</p>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                  <div className="bg-white rounded-xl shadow-lg p-6">
                      <div className="flex mb-4">
                          <Star className="text-yellow-400 fill-yellow-400" />
                          <Star className="text-yellow-400 fill-yellow-400" />
                          <Star className="text-yellow-400 fill-yellow-400" />
                          <Star className="text-yellow-400 fill-yellow-400" />
                          <Star className="text-yellow-400 fill-yellow-400" />
                      </div>
                      <p className="text-gray-700 mb-4">"Finally, study partners who actually show up! My productivity has doubled since joining. The Vouch Score system is genius."</p>
                      <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                              SC
                          </div>
                          <div>
                              <p className="font-semibold">Sarah Chen</p>
                              <p className="text-sm text-gray-600">Medicine, Year 3 • UCL</p>
                          </div>
                      </div>
                  </div>
                  <div className="bg-white rounded-xl shadow-lg p-6">
                      <div className="flex mb-4">
                          <Star className="text-yellow-400 fill-yellow-400" />
                          <Star className="text-yellow-400 fill-yellow-400" />
                          <Star className="text-yellow-400 fill-yellow-400" />
                          <Star className="text-yellow-400 fill-yellow-400" />
                          <Star className="text-yellow-400 fill-yellow-400" />
                      </div>
                      <p className="text-gray-700 mb-4">"Was struggling with dissertation motivation. Now I have regular sessions with other PhD students. Game changer!"</p>
                      <div className="flex items-center">
                          <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                              JW
                          </div>
                          <div>
                              <p className="font-semibold">James Wilson</p>
                              <p className="text-sm text-gray-600">Economics PhD • LSE</p>
                          </div>
                      </div>
                  </div>
                  <div className="bg-white rounded-xl shadow-lg p-6">
                      <div className="flex mb-4">
                          <Star className="text-yellow-400 fill-yellow-400" />
                          <Star className="text-yellow-400 fill-yellow-400" />
                          <Star className="text-yellow-400 fill-yellow-400" />
                          <Star className="text-yellow-400 fill-yellow-400" />
                          <Star className="text-yellow-400 fill-yellow-400" />
                      </div>
                      <p className="text-gray-700 mb-4">"Love the camera flexibility options. I can choose partners who match my preference. So much better than Zoom fatigue!"</p>
                      <div className="flex items-center">
                          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                              AP
                          </div>
                          <div>
                              <p className="font-semibold">Aisha Patel</p>
                              <p className="text-sm text-gray-600">Computer Science, Year 2 • Imperial</p>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </section>

      {/* University Logos */}
      <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <p className="text-center text-gray-600 mb-8">Trusted by students from</p>
              <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
                  <span className="text-2xl font-bold text-gray-700">UCL</span>
                  <span className="text-2xl font-bold text-gray-700">LSE</span>
                  <span className="text-2xl font-bold text-gray-700">King's</span>
                  <span className="text-2xl font-bold text-gray-700">Imperial</span>
                  <span className="text-2xl font-bold text-gray-700">Oxford</span>
                  <span className="text-2xl font-bold text-gray-700">Cambridge</span>
                  <span className="text-sm text-gray-500">+62 more</span>
              </div>
          </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-4xl font-bold mb-4 font-headline">Simple, Transparent Pricing</h2>
              <p className="text-xl text-gray-600 mb-12 font-body">Always free for students. Seriously.</p>
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
                  <h3 className="text-3xl font-bold mb-2">£0 / forever</h3>
                  <p className="text-xl mb-8">For verified UK university students</p>
                  <ul className="space-y-3 mb-8 text-left max-w-md mx-auto">
                      <li className="flex items-center">
                          <Check className="mr-3 h-5 w-5" />
                          Unlimited study sessions
                      </li>
                      <li className="flex items-center">
                          <Check className="mr-3 h-5 w-5" />
                          All matching & filtering features
                      </li>
                      <li className="flex items-center">
                          <Check className="mr-3 h-5 w-5" />
                          Built-in video sessions
                      </li>
                      <li className="flex items-center">
                          <Check className="mr-3 h-5 w-5" />
                          Progress tracking & analytics
                      </li>
                      <li className="flex items-center">
                          <Check className="mr-3 h-5 w-5" />
                          Calendar integration
                      </li>
                      <li className="flex items-center">
                          <Check className="mr-3 h-5 w-5" />
                          Mobile-friendly access
                      </li>
                  </ul>
                  <Link href="/dashboard" className="px-8 py-3 bg-white text-primary rounded-lg hover:bg-gray-100 font-medium">
                      Get Started Free →
                  </Link>
              </div>
              <p className="mt-8 text-sm text-gray-600">
                  Funded by university partnerships. No ads, no data selling, no catch.
              </p>
          </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-br from-blue-600 to-purple-600 py-20 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-4xl font-bold mb-4 font-headline">Ready to Find Your Study Squad?</h2>
              <p className="text-xl mb-8 font-body">Join 12,000+ UK students already crushing their study goals</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/dashboard" className="px-8 py-4 bg-white text-primary rounded-lg hover:bg-gray-100 font-medium text-lg">
                      Start Free with .ac.uk Email →
                  </Link>
                  <button className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg hover:bg-white hover:text-primary font-medium text-lg transition-all">
                      Questions? Chat with Us
                  </button>
              </div>
              <p className="mt-8 text-sm opacity-90">
                  Average setup time: 2 min 47 sec • No payment info required
              </p>
          </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid md:grid-cols-4 gap-8">
                  <div>
                      <div className="flex items-center space-x-2 mb-4">
                          <VouchlyLogo className="h-6 w-6 text-white" />
                          <h3 className="text-xl font-bold text-white">Vouchly</h3>
                      </div>
                      <p className="text-sm">The accountability-first study platform for UK university students.</p>
                  </div>
                  <div>
                      <h4 className="font-semibold text-white mb-4">Product</h4>
                      <ul className="space-y-2 text-sm">
                          <li><a href="#how-it-works" className="hover:text-white">How it Works</a></li>
                          <li><a href="#features" className="hover:text-white">Features</a></li>
                          <li><a href="#" className="hover:text-white">Universities</a></li>
                          <li><a href="#testimonials" className="hover:text-white">Success Stories</a></li>
                      </ul>
                  </div>
                  <div>
                      <h4 className="font-semibold text-white mb-4">Support</h4>
                      <ul className="space-y-2 text-sm">
                          <li><a href="#" className="hover:text-white">Help Center</a></li>
                          <li><a href="#" className="hover:text-white">Contact Us</a></li>
                          <li><a href="#" className="hover:text-white">Community Guidelines</a></li>
                          <li><a href="#" className="hover:text-white">Safety</a></li>
                      </ul>
                  </div>
                  <div>
                      <h4 className="font-semibold text-white mb-4">Connect</h4>
                      <ul className="space-y-2 text-sm">
                          <li><a href="#" className="hover:text-white">Blog</a></li>
                          <li><a href="#" className="hover:text-white">Instagram</a></li>
                          <li><a href="#" className="hover:text-white">TikTok</a></li>
                          <li><a href="#" className="hover:text-white">For Universities</a></li>
                      </ul>
                  </div>
              </div>
              <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
                  <p>&copy; 2024 Vouchly. All rights reserved. Made with ❤️ by students, for students.</p>
              </div>
          </div>
      </footer>
    </div>
  );
}
