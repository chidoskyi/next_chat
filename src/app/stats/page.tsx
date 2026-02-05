import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { TrendingUp, Users, Eye, Heart, MessageCircle, Share2, UserPlus } from "lucide-react"

export default function StatsPage() {
  return (
    <div className="min-h-screen bg-background lg:ml-64 pb-20 lg:pb-0">
      <div className="max-w-6xl mx-auto p-4 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Insights</h1>
          <p className="text-muted-foreground">Track your account performance and engagement</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Accounts Reached</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">45.2K</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-green-500">+12.5%</span> from last week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Interactions</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12.8K</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-green-500">+8.2%</span> from last week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8.4K</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-green-500">+15.3%</span> from last week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Followers</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+573</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-green-500">+22.1%</span> from last week
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Top Posts */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Top Posts</CardTitle>
            <CardDescription>Your best performing posts from the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  image: "/diverse-woman-portrait.png",
                  likes: 3420,
                  comments: 156,
                  shares: 89,
                  reach: 12500,
                },
                {
                  image: "/tabby-cat-sunbeam.png",
                  likes: 2890,
                  comments: 134,
                  shares: 67,
                  reach: 10200,
                },
                {
                  image: "/abstract-geometric-shapes.png",
                  likes: 2340,
                  comments: 98,
                  shares: 45,
                  reach: 8900,
                },
              ].map((post, index) => (
                <div key={index} className="flex items-center gap-4 p-4 rounded-lg border border-border">
                  <img
                    src={post.image || "/placeholder.svg"}
                    alt={`Post ${index + 1}`}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-red-500" />
                      <div>
                        <div className="text-sm font-semibold">{post.likes.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">Likes</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-blue-500" />
                      <div>
                        <div className="text-sm font-semibold">{post.comments}</div>
                        <div className="text-xs text-muted-foreground">Comments</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Share2 className="w-4 h-4 text-green-500" />
                      <div>
                        <div className="text-sm font-semibold">{post.shares}</div>
                        <div className="text-xs text-muted-foreground">Shares</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-purple-500" />
                      <div>
                        <div className="text-sm font-semibold">{post.reach.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">Reach</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Audience Demographics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Top Locations</CardTitle>
              <CardDescription>Where your audience is from</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { country: "United States", percentage: 35, count: "15.8K" },
                  { country: "United Kingdom", percentage: 22, count: "9.9K" },
                  { country: "Canada", percentage: 15, count: "6.8K" },
                  { country: "Australia", percentage: 12, count: "5.4K" },
                  { country: "Germany", percentage: 8, count: "3.6K" },
                ].map((location, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{location.country}</span>
                      <span className="text-muted-foreground">{location.count}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="instagram-gradient h-2 rounded-full"
                        style={{ width: `${location.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Engagement Rate</CardTitle>
              <CardDescription>How your audience interacts with your content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Likes</span>
                    <span className="text-sm text-muted-foreground">68%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: "68%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Comments</span>
                    <span className="text-sm text-muted-foreground">18%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: "18%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Shares</span>
                    <span className="text-sm text-muted-foreground">10%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: "10%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Saves</span>
                    <span className="text-sm text-muted-foreground">4%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: "4%" }} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
