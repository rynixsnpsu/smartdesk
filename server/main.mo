import Set "mo:core/Set";
import Map "mo:core/Map";
import Text "mo:core/Text";

actor {
  type Feature = {
    icon : Text;
    title : Text;
    description : Text;
  };

  type Statistic = {
    title : Text;
    value : Nat;
    unit : Text;
  };

  type Testimonial = {
    author : Text;
    position : Text;
    quote : Text;
    university : Text;
  };

  public type Cta = {
    ctaLabel : Text;
    link : Text;
  };

  // Comparison modules
  module Feature {
    public func compare(a : Feature, b : Feature) : { #less; #equal; #greater } {
      Text.compare(a.title, b.title);
    };
  };

  module Statistic {
    public func compare(a : Statistic, b : Statistic) : { #less; #equal; #greater } {
      Text.compare(a.title, b.title);
    };
  };

  module Testimonial {
    public func compare(a : Testimonial, b : Testimonial) : { #less; #equal; #greater } {
      Text.compare(a.author, b.author);
    };
  };

  module Cta {
    public func compare(a : Cta, b : Cta) : { #less; #equal; #greater } {
      Text.compare(a.ctaLabel, b.ctaLabel);
    };
  };

  let featureSet = Set.empty<Feature>();
  let statisticSet = Set.empty<Statistic>();
  let testimonialSet = Set.empty<Testimonial>();
  let ctaSet = Set.empty<Cta>();

  public shared ({ caller }) func initialize() : async () {
    // Add Features
    featureSet.add({
      icon = "🧠";
      title = "AI-Powered Analysis";
      description = "Advanced machine learning algorithms analyze student feedback for actionable insights.";
    });

    featureSet.add({
      icon = "📊";
      title = "Real-Time Dashboards";
      description = "Live, interactive dashboards provide up-to-date feedback intelligence.";
    });

    featureSet.add({
      icon = "🔎";
      title = "Deep Sentiment Analysis";
      description = "Analyze sentiment trends and identify areas for improvement.";
    });

    featureSet.add({
      icon = "⚡️";
      title = "Automated Reports";
      description = "Generate comprehensive reports with a single click.";
    });

    featureSet.add({
      icon = "🔗";
      title = "Seamless Integration";
      description = "Easily integrates with existing university systems.";
    });

    featureSet.add({
      icon = "👥";
      title = "Collaborative Tools";
      description = "Facilitate teamwork and collaboration across departments.";
    });

    // Add Statistics
    statisticSet.add({
      title = "Feedback Analyzed";
      value = 120_000;
      unit = "responses";
    });

    statisticSet.add({
      title = "Insight Generation";
      value = 98_000;
      unit = "insights";
    });

    statisticSet.add({
      title = "Sentiment Clarity";
      value = 87;
      unit = "%";
    });

    statisticSet.add({
      title = "Report Automation";
      value = 75;
      unit = "% time saved";
    });

    // Add Testimonials
    testimonialSet.add({
      author = "Dr. Emily Chen";
      position = "Dean of Students";
      quote = "Smart Desk has transformed how we interpret and act on student feedback. The platform's insights are invaluable.";
      university = "Harvard University";
    });

    testimonialSet.add({
      author = "Prof. Michael Smith";
      position = "Director of Academic Affairs";
      quote = "The AI-driven analytics provide deep, actionable insights that were previously impossible to obtain.";
      university = "MIT";
    });

    testimonialSet.add({
      author = "Sarah Johnson";
      position = "Student Affairs Coordinator";
      quote = "Smart Desk's real-time dashboards have made our feedback process seamless and efficient.";
      university = "Stanford University";
    });

    // Add CTAs
    ctaSet.add({
      ctaLabel = "Submit Feedback";
      link = "#/submit";
    });

    ctaSet.add({
      ctaLabel = "View Insights";
      link = "#/insights";
    });

    ctaSet.add({
      ctaLabel = "Explore Dashboard";
      link = "#/dashboard";
    });
  };
};
