import PageFadeIn from '../components/PageFadeIn'

export default function About() {
  return (
    <PageFadeIn>
      <section className="pt-10">
        <div className="mb-12">
          <p className="text-sm uppercase tracking-[0.25em] text-fuchsia-600 dark:text-fuchsia-300">
            About BoxBite
          </p>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
            Your culinary journey starts here
          </h2>
        </div>

        <div className="space-y-12">
          {/* Mission Section */}
          <div className="glass rounded-xl p-8 animate-fadeIn" style={{ animationDelay: '0ms' }}>
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-500 to-amber-400 text-2xl shadow-lg shadow-fuchsia-900/40">
                🎯
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                Our Mission
              </h3>
            </div>
            <p className="text-lg leading-relaxed text-slate-700 dark:text-slate-300">
              At BoxBite, our mission is to inspire and empower home cooks of all skill levels to discover, 
              plan, and prepare delicious meals with confidence. We believe that cooking should be an enjoyable, 
              stress-free experience that brings people together and nourishes both body and soul.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-slate-700 dark:text-slate-300">
              We've created a platform that eliminates the daily question of "What should I cook?" by providing 
              personalized meal planning, recipe discovery, and pantry management tools—all in one beautiful, 
              intuitive interface.
            </p>
          </div>

          {/* Vision Section */}
          <div className="glass rounded-xl p-8 animate-fadeIn" style={{ animationDelay: '100ms' }}>
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-500 to-amber-400 text-2xl shadow-lg shadow-fuchsia-900/40">
                ✨
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                Our Vision
              </h3>
            </div>
            <p className="text-lg leading-relaxed text-slate-700 dark:text-slate-300">
              We envision a world where meal planning is effortless, cooking is joyful, and every home cook 
              feels confident experimenting with new flavors and techniques. BoxBite aims to become the go-to 
              companion for millions of food enthusiasts who want to eat well, reduce food waste, and create 
              memorable dining experiences.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-slate-700 dark:text-slate-300">
              Through continuous innovation and a deep understanding of our users' needs, we're building a 
              platform that adapts to your lifestyle, preferences, and dietary requirements—making healthy, 
              home-cooked meals accessible to everyone.
            </p>
          </div>

          {/* Values Section */}
          <div className="glass rounded-xl p-8 animate-fadeIn" style={{ animationDelay: '200ms' }}>
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-500 to-amber-400 text-2xl shadow-lg shadow-fuchsia-900/40">
                💚
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                Our Values
              </h3>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-slate-900/50">
                <h4 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
                  Simplicity
                </h4>
                <p className="text-slate-600 dark:text-slate-400">
                  We believe great tools should be intuitive and easy to use, allowing you to focus on what 
                  matters most—creating delicious meals.
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-slate-900/50">
                <h4 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
                  Inspiration
                </h4>
                <p className="text-slate-600 dark:text-slate-400">
                  We're here to spark your culinary creativity with diverse recipes, smart suggestions, and 
                  personalized recommendations that match your taste.
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-slate-900/50">
                <h4 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
                  Sustainability
                </h4>
                <p className="text-slate-600 dark:text-slate-400">
                  We promote mindful cooking practices that reduce food waste and help you make the most of 
                  your pantry ingredients.
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-slate-900/50">
                <h4 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
                  Community
                </h4>
                <p className="text-slate-600 dark:text-slate-400">
                  Cooking brings people together. We're building a platform that supports and celebrates 
                  the joy of sharing meals with loved ones.
                </p>
              </div>
            </div>
          </div>

          {/* Features Highlight */}
          <div className="glass rounded-xl p-8 animate-fadeIn" style={{ animationDelay: '300ms' }}>
            <h3 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">
              What Makes BoxBite Special
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-fuchsia-500/20 to-amber-400/20 text-fuchsia-600 dark:text-fuchsia-300">
                  🍳
                </div>
                <div>
                  <h4 className="mb-1 font-semibold text-slate-900 dark:text-white">Smart Meal Planning</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Weekly planner that generates balanced meal ideas based on your preferences
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-fuchsia-500/20 to-amber-400/20 text-fuchsia-600 dark:text-fuchsia-300">
                  🔍
                </div>
                <div>
                  <h4 className="mb-1 font-semibold text-slate-900 dark:text-white">Recipe Discovery</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Explore thousands of recipes with advanced search and filtering options
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-fuchsia-500/20 to-amber-400/20 text-fuchsia-600 dark:text-fuchsia-300">
                  🥘
                </div>
                <div>
                  <h4 className="mb-1 font-semibold text-slate-900 dark:text-white">Pantry Management</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Track your ingredients and find recipes that use what you already have
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-fuchsia-500/20 to-amber-400/20 text-fuchsia-600 dark:text-fuchsia-300">
                  ❤️
                </div>
                <div>
                  <h4 className="mb-1 font-semibold text-slate-900 dark:text-white">Save Favorites</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Keep track of your favorite recipes and access them anytime, anywhere
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-fuchsia-500/20 to-amber-400/20 text-fuchsia-600 dark:text-fuchsia-300">
                  ☁️
                </div>
                <div>
                  <h4 className="mb-1 font-semibold text-slate-900 dark:text-white">Cloud Sync</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Your plans and favorites sync across all your devices seamlessly
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-fuchsia-500/20 to-amber-400/20 text-fuchsia-600 dark:text-fuchsia-300">
                  🎨
                </div>
                <div>
                  <h4 className="mb-1 font-semibold text-slate-900 dark:text-white">Beautiful Design</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Enjoy a delightful user experience with our modern, intuitive interface
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="rounded-xl border-2 border-dashed border-fuchsia-300 bg-gradient-to-br from-fuchsia-50 to-amber-50 p-8 text-center dark:border-fuchsia-500/50 dark:from-fuchsia-950/20 dark:to-amber-950/20 animate-fadeIn" style={{ animationDelay: '400ms' }}>
            <h3 className="mb-4 text-2xl font-bold text-slate-900 dark:text-white">
              Ready to Transform Your Cooking?
            </h3>
            <p className="mb-6 text-lg text-slate-700 dark:text-slate-300">
              Join thousands of home cooks who are already using BoxBite to plan their meals and discover new recipes.
            </p>
            <a
              href="/"
              className="inline-block rounded-lg bg-gradient-to-r from-fuchsia-500 to-amber-400 px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-fuchsia-900/40 transition-all duration-200 hover:brightness-110 hover:shadow-xl active:scale-95"
            >
              Get Started Now
            </a>
          </div>
        </div>
      </section>
    </PageFadeIn>
  )
}

