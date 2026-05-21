import { useNavigate } from "react-router-dom";
import { styled, keyframes } from "@washingtonpost/wpds-ui-kit";
import { Button, Icon } from "@washingtonpost/wpds-ui-kit";
import Check from "@washingtonpost/wpds-assets/asset/check";
import Star from "@washingtonpost/wpds-assets/asset/star-full";
import Calendar from "@washingtonpost/wpds-assets/asset/calendar";
import Phone from "@washingtonpost/wpds-assets/asset/phone";
import { useAuth } from "../context/AuthContext";

const fadeUp = keyframes({
  from: { opacity: 0, transform: "translateY(24px)" },
  to: { opacity: 1, transform: "translateY(0)" },
});

const HeroSection = styled("section", {
  background: "linear-gradient(135deg, #0f4c75 0%, #1b6ca8 50%, #0a9396 100%)",
  color: "white",
  padding: "$400 $150",
  textAlign: "center",
  "@sm": { padding: "$250 $100" },
});

const HeroContent = styled("div", {
  maxWidth: "760px",
  margin: "0 auto",
  animation: `${fadeUp} 0.7s ease`,
});

const HeroHeadline = styled("h1", {
  fontFamily: "$headline",
  fontWeight: "$bold",
  fontSize: "$400",
  lineHeight: "$headline",
  marginBottom: "$100",
  "@sm": { fontSize: "$250" },
});

const HeroSubhead = styled("p", {
  fontFamily: "$subhead",
  fontSize: "$125",
  lineHeight: "$body",
  opacity: 0.9,
  marginBottom: "$200",
  "@sm": { fontSize: "$100" },
});

const HeroCTA = styled("div", {
  display: "flex",
  gap: "$100",
  justifyContent: "center",
  flexWrap: "wrap",
});

const Section = styled("section", {
  padding: "$300 $150",
  maxWidth: "1200px",
  margin: "0 auto",
  "@sm": { padding: "$200 $100" },
});

const SectionTitle = styled("h2", {
  fontFamily: "$headline",
  fontWeight: "$bold",
  fontSize: "$250",
  lineHeight: "$headline",
  color: "$primary",
  textAlign: "center",
  marginBottom: "$050",
  "@sm": { fontSize: "$175" },
});

const SectionSubtitle = styled("p", {
  fontFamily: "$meta",
  fontSize: "$100",
  color: "$onBackground-subtle",
  textAlign: "center",
  marginBottom: "$200",
});

const ServicesGrid = styled("div", {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "$150",
  "@md": { gridTemplateColumns: "repeat(2, 1fr)" },
  "@sm": { gridTemplateColumns: "1fr" },
});

const ServiceCard = styled("div", {
  backgroundColor: "$surface",
  border: "1px solid $subtle",
  borderRadius: "$075",
  padding: "$175",
  boxShadow: "$100",
  transition: "transform 0.2s, box-shadow 0.2s",
  "@hover": {
    "&:hover": {
      transform: "translateY(-4px)",
      boxShadow: "$300",
    },
  },
});

const ServiceIcon = styled("div", {
  width: "48px",
  height: "48px",
  borderRadius: "$050",
  backgroundColor: "$teal600",
  color: "$teal100",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: "$100",
  fontSize: "$175",
});

const ServiceName = styled("h3", {
  fontFamily: "$subhead",
  fontWeight: "$bold",
  fontSize: "$112",
  color: "$primary",
  marginBottom: "$050",
});

const ServiceDesc = styled("p", {
  fontFamily: "$meta",
  fontSize: "$087",
  color: "$onBackground-subtle",
  lineHeight: "$body",
});

const ServicePrice = styled("span", {
  fontFamily: "$meta",
  fontWeight: "$bold",
  fontSize: "$100",
  color: "$teal100",
  display: "block",
  marginTop: "$075",
});

const StepsGrid = styled("div", {
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  gap: "$150",
  "@md": { gridTemplateColumns: "repeat(2, 1fr)" },
  "@sm": { gridTemplateColumns: "1fr" },
});

const StepCard = styled("div", {
  textAlign: "center",
  padding: "$150",
});

const StepNumber = styled("div", {
  width: "56px",
  height: "56px",
  borderRadius: "$round",
  background: "linear-gradient(135deg, #0a9396, #1b6ca8)",
  color: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: "$headline",
  fontWeight: "$bold",
  fontSize: "$150",
  margin: "0 auto $100",
});

const StepTitle = styled("h3", {
  fontFamily: "$subhead",
  fontWeight: "$bold",
  fontSize: "$112",
  color: "$primary",
  marginBottom: "$050",
});

const StepDesc = styled("p", {
  fontFamily: "$meta",
  fontSize: "$087",
  color: "$onBackground-subtle",
  lineHeight: "$body",
});

const TestimonialsGrid = styled("div", {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "$150",
  "@md": { gridTemplateColumns: "repeat(2, 1fr)" },
  "@sm": { gridTemplateColumns: "1fr" },
});

const TestimonialCard = styled("div", {
  backgroundColor: "$surface",
  border: "1px solid $subtle",
  borderRadius: "$075",
  padding: "$175",
  boxShadow: "$100",
});

const Stars = styled("div", {
  display: "flex",
  gap: "$025",
  marginBottom: "$075",
  color: "$gold100",
});

const TestimonialText = styled("p", {
  fontFamily: "$body",
  fontSize: "$087",
  color: "$onBackground",
  lineHeight: "$body",
  marginBottom: "$100",
  fontStyle: "italic",
});

const TestimonialAuthor = styled("span", {
  fontFamily: "$meta",
  fontWeight: "$bold",
  fontSize: "$087",
  color: "$primary",
});

const CTASection = styled("section", {
  background: "linear-gradient(135deg, #0a9396 0%, #0f4c75 100%)",
  padding: "$300 $150",
  textAlign: "center",
  color: "white",
});

const CTATitle = styled("h2", {
  fontFamily: "$headline",
  fontWeight: "$bold",
  fontSize: "$250",
  lineHeight: "$headline",
  marginBottom: "$100",
  "@sm": { fontSize: "$175" },
});

const CTASubtitle = styled("p", {
  fontFamily: "$meta",
  fontSize: "$112",
  opacity: 0.9,
  marginBottom: "$200",
});

const SERVICES = [
  {
    icon: "🧺",
    name: "Wash & Fold",
    desc: "Fresh, clean clothes folded and ready to wear.",
    price: "from $3.50/kg",
  },
  {
    icon: "👔",
    name: "Dry Cleaning",
    desc: "Professional care for your delicate and formal wear.",
    price: "from $12.00/kg",
  },
  {
    icon: "🔲",
    name: "Ironing & Pressing",
    desc: "Crisp, wrinkle-free results every time.",
    price: "from $4.00/kg",
  },
  {
    icon: "✨",
    name: "Wash & Iron",
    desc: "Complete laundry service from wash to wardrobe-ready.",
    price: "from $6.50/kg",
  },
  {
    icon: "🛏️",
    name: "Duvet & Bedding",
    desc: "Specialized washing for duvets, blankets, and bedding.",
    price: "from $8.00/kg",
  },
  {
    icon: "⚡",
    name: "Express Service",
    desc: "Same-day turnaround for when you need it fast.",
    price: "from $15.00/kg",
  },
];

const TESTIMONIALS = [
  {
    text: "FreshWash has completely changed my laundry routine. Fast pickup, excellent quality, and delivered right to my door!",
    author: "Sarah M.",
    rating: 5,
  },
  {
    text: "The express service is a lifesaver. I needed my suit cleaned for a meeting and they delivered same day. Amazing!",
    author: "James K.",
    rating: 5,
  },
  {
    text: "Best laundry service in the city. The order tracking feature keeps me updated every step of the way.",
    author: "Priya L.",
    rating: 5,
  },
];

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div>
      {/* Hero */}
      <HeroSection>
        <HeroContent>
          <HeroHeadline>
            Laundry Done Right,
            <br />
            Every Time.
          </HeroHeadline>
          <HeroSubhead>
            Professional laundry pickup, cleaning, and delivery at your
            doorstep. Track your order in real-time.
          </HeroSubhead>
          <HeroCTA>
            <Button
              variant="cta"
              css={{
                backgroundColor: "white",
                color: "#0a9396",
                fontWeight: "$bold",
                "&:hover": { backgroundColor: "$gray400" },
              }}
              onClick={() => navigate(user ? "/orders/new" : "/register")}
            >
              Schedule Pickup
            </Button>
            <Button
              isOutline
              variant="primary"
              css={{
                borderColor: "rgba(255,255,255,0.6)",
                color: "white",
                "&:hover": {
                  borderColor: "white",
                  backgroundColor: "rgba(255,255,255,0.1)",
                },
              }}
              onClick={() => navigate("/login")}
            >
              Track Your Order
            </Button>
          </HeroCTA>
        </HeroContent>
      </HeroSection>

      {/* Services */}
      <Section>
        <SectionTitle>Our Services</SectionTitle>
        <SectionSubtitle>
          Professional laundry solutions for every need
        </SectionSubtitle>
        <ServicesGrid>
          {SERVICES.map((s) => (
            <ServiceCard key={s.name}>
              <ServiceIcon>{s.icon}</ServiceIcon>
              <ServiceName>{s.name}</ServiceName>
              <ServiceDesc>{s.desc}</ServiceDesc>
              <ServicePrice>{s.price}</ServicePrice>
            </ServiceCard>
          ))}
        </ServicesGrid>
      </Section>

      {/* Divider */}
      <div
        style={{
          height: "1px",
          background: "var(--wpds-colors-subtle)",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      />

      {/* How it works */}
      <Section>
        <SectionTitle>How It Works</SectionTitle>
        <SectionSubtitle>
          Four simple steps to fresh laundry
        </SectionSubtitle>
        <StepsGrid>
          {[
            {
              n: "1",
              title: "Place Order",
              desc: "Select your items and services through our easy wizard.",
            },
            {
              n: "2",
              title: "We Collect",
              desc: "Our team picks up your laundry at your scheduled time.",
            },
            {
              n: "3",
              title: "We Clean",
              desc: "Professional cleaning with real-time status updates.",
            },
            {
              n: "4",
              title: "Delivered",
              desc: "Fresh clothes delivered back to your door.",
            },
          ].map((step) => (
            <StepCard key={step.n}>
              <StepNumber>{step.n}</StepNumber>
              <StepTitle>{step.title}</StepTitle>
              <StepDesc>{step.desc}</StepDesc>
            </StepCard>
          ))}
        </StepsGrid>
      </Section>

      {/* Features */}
      <div style={{ backgroundColor: "var(--wpds-colors-surface)" }}>
        <Section>
          <SectionTitle>Why Choose FreshWash?</SectionTitle>
          <SectionSubtitle>
            Modern features for a seamless experience
          </SectionSubtitle>
          <ServicesGrid>
            {[
              {
                icon: "📍",
                title: "Live Tracking",
                desc: "Real-time order status from collection to delivery.",
              },
              {
                icon: "🔔",
                title: "Instant Alerts",
                desc: "Get notified at every step of your laundry journey.",
              },
              {
                icon: "💳",
                title: "Easy Payment",
                desc: "Pay with cash, card, or mobile — your choice.",
              },
              {
                icon: "📅",
                title: "Flexible Pickup",
                desc: "Schedule collection at a time that suits you.",
              },
              {
                icon: "🌿",
                title: "Eco-Friendly",
                desc: "We use environmentally responsible cleaning products.",
              },
              {
                icon: "⭐",
                title: "Quality Guarantee",
                desc: "Not happy? We'll re-clean it free of charge.",
              },
            ].map((f) => (
              <ServiceCard key={f.title}>
                <ServiceIcon>{f.icon}</ServiceIcon>
                <ServiceName>{f.title}</ServiceName>
                <ServiceDesc>{f.desc}</ServiceDesc>
              </ServiceCard>
            ))}
          </ServicesGrid>
        </Section>
      </div>

      {/* Testimonials */}
      <Section>
        <SectionTitle>What Customers Say</SectionTitle>
        <SectionSubtitle>Trusted by thousands of happy customers</SectionSubtitle>
        <TestimonialsGrid>
          {TESTIMONIALS.map((t) => (
            <TestimonialCard key={t.author}>
              <Stars>
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Icon key={i} size="100" label="star">
                    <Star />
                  </Icon>
                ))}
              </Stars>
              <TestimonialText>"{t.text}"</TestimonialText>
              <TestimonialAuthor>— {t.author}</TestimonialAuthor>
            </TestimonialCard>
          ))}
        </TestimonialsGrid>
      </Section>

      {/* CTA */}
      <CTASection>
        <CTATitle>Ready for Fresh Laundry?</CTATitle>
        <CTASubtitle>
          Join thousands of customers who trust FreshWash
        </CTASubtitle>
        <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
          <Button
            variant="cta"
            css={{
              backgroundColor: "white",
              color: "#0a9396",
              fontWeight: "$bold",
            }}
            onClick={() => navigate(user ? "/orders/new" : "/register")}
          >
            Get Started Free
          </Button>
          <Button
            isOutline
            variant="primary"
            css={{
              borderColor: "rgba(255,255,255,0.6)",
              color: "white",
            }}
            onClick={() => navigate("/login")}
          >
            Sign In
          </Button>
        </div>
      </CTASection>

      {/* Footer */}
      <footer
        style={{
          backgroundColor: "var(--wpds-colors-gray60)",
          color: "white",
          padding: "32px 24px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontFamily: "var(--wpds-fonts-meta)",
            fontSize: "var(--wpds-fontSizes-087)",
            opacity: 0.8,
          }}
        >
          © 2026 FreshWash. All rights reserved. | Professional Laundry
          Management
        </p>
      </footer>
    </div>
  );
}
