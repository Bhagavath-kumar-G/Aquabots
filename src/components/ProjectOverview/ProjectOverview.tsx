import React, { useState } from 'react';
import { 
  Cpu, 
  Wifi, 
  Activity, 
  Eye, 
  AlertTriangle, 
  CheckCircle, 
  ShieldCheck, 
  Compass, 
  Layers, 
  Award, 
  Maximize2,
  HardHat,
  DollarSign,
  Leaf,
  Building2,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface ProjectOverviewProps {
  onNavigateToDashboard: () => void;
  onNavigateToPublic: () => void;
}

export const ProjectOverview: React.FC<ProjectOverviewProps> = ({ 
  onNavigateToDashboard,
  onNavigateToPublic
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'workflow' | 'hardware' | 'engineering' | 'impact'>('all');
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);

  const workflowSteps = [
    {
      step: '01',
      title: 'Optical & Ultrasonic Sensing',
      desc: 'Forward-facing camera captures high-contrast video while an HC-SR04 ultrasonic sound transducer measures water surface distance clearance in narrow channels.',
      icon: Eye,
      color: 'from-cyan-500 to-blue-600',
      badge: 'Hardware Sensor'
    },
    {
      step: '02',
      title: 'ESP32 Edge Microcontroller',
      desc: 'Compact dual-core ESP32 chip samples distance echoes, filters noise pulses, buffers camera snapshots, and monitors Li-ion battery health.',
      icon: Cpu,
      color: 'from-indigo-500 to-purple-600',
      badge: 'Edge Processing'
    },
    {
      step: '03',
      title: 'Autonomous Triage Rules',
      desc: 'On-device logic compares water level thresholds and visual blockage density against village drainage safety profiles to compute incident urgency.',
      icon: Activity,
      color: 'from-amber-500 to-orange-600',
      badge: 'Prioritization Engine'
    },
    {
      step: '04',
      title: 'Wi-Fi Telemetry Transmission',
      desc: 'Transmits JSON telemetry packets over 802.11 b/g/n Wi-Fi to the village mesh node, with local flash memory backup for subterranean dropouts.',
      icon: Wifi,
      color: 'from-sky-500 to-cyan-600',
      badge: 'Wireless Uplink'
    },
    {
      step: '05',
      title: 'Panchayat Web Command Center',
      desc: 'Real-time GIS map interface visualizes culvert segments, color-coded water depth levels, and live camera inspection feeds for village administrators.',
      icon: Layers,
      color: 'from-emerald-500 to-teal-600',
      badge: 'Web Dashboard'
    },
    {
      step: '06',
      title: 'Targeted Sanitation Action',
      desc: 'Automated alert dispatches municipal desilting squads with exact GPS coordinates and debris classification before monsoons trigger flooding.',
      icon: HardHat,
      color: 'from-red-500 to-rose-600',
      badge: 'Field Response'
    }
  ];

  const hardwareSpecs = [
    {
      name: 'ESP32-CAM Microcontroller',
      role: 'Core Edge Processor & Camera Interface',
      details: 'Dual-core Xtensa 32-bit LX6 @ 240MHz, 520KB SRAM + 4MB external PSRAM, integrated 2.4GHz Wi-Fi (802.11 b/g/n).',
      status: 'Implemented'
    },
    {
      name: 'HC-SR04 Ultrasonic Acoustic Sensor',
      role: 'Non-Contact Water Depth Monitoring',
      details: '40kHz sonic echo pulses measuring 2cm to 400cm surface distance with 3mm precision, angled downward for drain flow clearance.',
      status: 'Implemented'
    },
    {
      name: 'L298N Dual H-Bridge Motor Driver',
      role: 'Mobility & Mud Traction Drive',
      details: 'Drives four high-torque yellow TT geared DC motors paired with knobby rubber wheels to navigate wet leaves and silt deposits.',
      status: 'Implemented'
    },
    {
      name: 'Power & Voltage Regulation',
      role: 'Dual 18650 Li-ion Battery Pack',
      details: '7.4V nominal configuration with LM2596 high-efficiency buck converter stepping down to filtered 5V rail for stable sensor operations.',
      status: 'Implemented'
    },
    {
      name: 'IP65 Water-Resistant Enclosure',
      role: 'Electronics & Wiring Protection',
      details: 'Polycarbonate transparent project box with silicone sealing gasket and rubberized cable glands preventing splash and moisture ingress.',
      status: 'Implemented'
    },
    {
      name: 'Subterranean Flash Queue (Offline Buffer)',
      role: 'Intermittent Connectivity Resilience',
      details: 'Caches telemetry logs to SPIFFS flash during deep culvert signal attenuation and auto-bursts queued data when rejoining Wi-Fi.',
      status: 'Firmware Feature'
    }
  ];

  const engineeringChallenges = [
    {
      title: 'Water & Silt Ingress Protection',
      problem: 'Storm drains are damp, muddy environments where splashes, condensation, and chemical runoffs can destroy exposed electronics.',
      solution: 'The rover mounts all sensitive microelectronics, batteries, and drivers inside an IP65 transparent sealed enclosure with rubberized pass-through glands, keeping electrical components dry while wheels traverse standing water.',
      tag: 'Enclosure Engineering'
    },
    {
      title: 'Low-Light Drain Illumination',
      problem: 'Covered underground stormwater pipes and culverts have zero ambient light, rendering standard optical sensors completely blind.',
      solution: 'Dual high-lumen, wide-beam white LED headlights are positioned beside the camera lens to cleanly illuminate debris, silt accumulation, and water level reflections without overwhelming lens glare.',
      tag: 'Optical Visibility'
    },
    {
      title: 'Narrow Cross-Sections & Debris Obstacles',
      problem: 'Rural village storm drains can be as narrow as 25-30cm and are littered with jagged stones, plastic waste, and wet foliage.',
      solution: 'Compact ~20cm chassis width with high-traction knobby rubber tires and low center-of-gravity allows the rover to crawl over leaf piles and silt bars without flipping over.',
      tag: 'Mechanical Mobility'
    },
    {
      title: 'Subterranean RF Signal Attenuation',
      problem: 'Wi-Fi radio signals attenuate rapidly through reinforced concrete culverts and underground drain covers.',
      solution: 'The ESP32 firmware features an offline telemetry queue stored in local Flash memory. If Wi-Fi connection drops, telemetry continues recording and automatically synchronizes once the rover nears a manhole opening.',
      tag: 'Firmware Reliability'
    },
    {
      title: 'Battery Longevity in Remote Drains',
      problem: 'Constant camera streaming and DC motor driving can deplete portable batteries rapidly during long culvert surveys.',
      solution: 'Dual 18650 Li-ion cells (7.4V, ~2600mAh) coupled with duty-cycle power budgeting allow up to 90 minutes of active inspection crawl, with analog voltage sensing providing real-time battery telemetry.',
      tag: 'Power Management'
    }
  ];

  const impactPillars = [
    {
      title: 'Worker Safety & Dignity',
      category: 'Social Impact',
      icon: HardHat,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      description: 'Significantly reduces the necessity for sanitation workers to physically enter narrow, contaminated, or hazardous storm drains. Eliminates dangerous exposure to toxic gases, sharp debris, and biohazards by using robotic scouting first.'
    },
    {
      title: 'Agricultural & Infrastructure Savings',
      category: 'Economic Impact',
      icon: DollarSign,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      description: 'Early detection of silt dams and debris chokes costs pennies to clear proactively with hand rakes. This prevents millions of rupees in damage from waterlogged roads, collapsed asphalt, and flood damage to standing crops in rural panchayats.'
    },
    {
      title: 'Waste Interception & River Health',
      category: 'Environmental Impact',
      icon: Leaf,
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
      description: 'Pinpoints non-biodegradable polythene bags, plastic bottles, and chemical sludge before heavy monsoon downpours flush them into agricultural canals, village lakes, and perennial river ecosystems.'
    },
    {
      title: 'Proactive Panchayat Governance',
      category: 'Governance & Civic Triage',
      icon: Building2,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
      description: 'Equips village panchayat presidents and municipal engineers with an explainable, data-driven audit trail. Converts emergency panic into scheduled, prioritized desilting work orders before monsoon rains begin.'
    }
  ];

  return (
    <div className="space-y-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Hero Presentation Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 border border-slate-800 shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,165,233,0.15),rgba(255,255,255,0))]"></div>
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-10 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-xs font-bold uppercase tracking-wider">
                <Award className="w-3.5 h-3.5 text-cyan-400" />
                Seva First Innovation Challenge 2026
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold uppercase tracking-wider">
                Team Innovators
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-xs uppercase font-extrabold tracking-widest text-slate-400">
                Theme: Village & Panchayat Development, Agriculture & Rural Economy
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                DrainPulse
              </h1>
              <p className="text-lg sm:text-xl font-bold bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
                Detect Blockages Early. Prevent Flooding Before It Starts.
              </p>
            </div>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              An affordable, compact, ESP32-powered robotic rover designed to inspect narrow stormwater drains, identify waste and blockages, monitor rising water levels, and transmit real-time alerts to a web dashboard over Wi-Fi.
            </p>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-1.5 text-xs text-slate-300">
              <div className="flex items-center gap-2 font-bold text-cyan-400">
                <CheckCircle className="w-4 h-4 shrink-0 text-cyan-400" />
                <span>The Core Engineering Mission</span>
              </div>
              <p className="leading-relaxed text-slate-300">
                In rural panchayats and suburban zones, blocked roadside culverts choke silently with plastic waste and silt. Manual inspection is slow and hazardous. DrainPulse provides student-buildable, low-cost robotics that gives village authorities early warnings before heavy monsoon downpours turn minor clogs into disastrous inundations.
              </p>
            </div>

            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={onNavigateToDashboard}
                className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 transition shadow-lg shadow-cyan-500/25"
              >
                <span>Launch Live Rover Monitor</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={onNavigateToPublic}
                className="px-4 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold rounded-xl text-xs sm:text-sm border border-slate-700 flex items-center gap-2 transition"
              >
                <span>Panchayat Public Portal</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-mono font-medium">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                <span>Dashboard in Simulation Mode</span>
              </div>
            </div>
          </div>

          {/* Right Hero Image Column */}
          <div className="lg:col-span-5 relative">
            <div 
              className="relative rounded-2xl overflow-hidden border border-cyan-500/30 shadow-2xl bg-slate-900 group cursor-pointer"
              onClick={() => setEnlargedImage('/images/drainpulse/hero_drain_rover.jpg')}
            >
              <img 
                src="/images/drainpulse/hero_drain_rover.jpg" 
                alt="DrainPulse compact rover operating inside narrow stormwater drain"
                className="w-full h-72 sm:h-84 object-cover object-center group-hover:scale-105 transition duration-500"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
              
              <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700 text-[10px] font-mono text-cyan-300 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                <span>DrainPulse RP-1 • Concrete Culvert Test</span>
              </div>

              <div className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/60 text-slate-300 hover:text-white">
                <Maximize2 className="w-4 h-4" />
              </div>

              <div className="absolute bottom-3 left-3 right-3 text-white">
                <p className="text-xs font-bold leading-snug">
                  Active Culvert Crawl: Forward Camera + Ultrasonic Echo Sensor
                </p>
                <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-1">
                  Navigating wet leaves, plastic debris, and standing drain water.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter / Jump Pills */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Sections:</span>
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'all', label: 'Complete Showcase' },
              { id: 'workflow', label: '1. How It Works' },
              { id: 'hardware', label: '2. Hardware Architecture' },
              { id: 'engineering', label: '3. Engineering Challenges' },
              { id: 'impact', label: '4. Rural Panchayat Impact' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
                  activeTab === tab.id 
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20' 
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs text-slate-400 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Student Build Cost: <strong>&lt; ₹4,500 ($54 USD)</strong></span>
        </div>
      </div>

      {/* Section 1: How It Works Workflow */}
      {(activeTab === 'all' || activeTab === 'workflow') && (
        <section className="space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-extrabold uppercase tracking-widest text-cyan-400">
              System Architecture & Data Pipeline
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              How DrainPulse Works — From Drain Floor to Panchayat Action
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-3xl">
              A clean 6-stage operational pipeline: ultrasonic sound waves and optical cameras capture the drain condition, the ESP32 processes sensor inputs locally, and data transmits wirelessly to village decision-makers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workflowSteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div 
                  key={idx}
                  className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 hover:border-slate-700 transition relative flex flex-col justify-between group shadow-sm"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-2xl font-black text-slate-700 group-hover:text-cyan-400 transition">
                        {step.step}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {step.badge}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-xl bg-gradient-to-br ${step.color} text-white shadow-md`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <h3 className="font-bold text-sm text-white">{step.title}</h3>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>Phase {step.step} of 06</span>
                    <span className="text-cyan-400 font-semibold group-hover:translate-x-1 transition flex items-center gap-0.5">
                      Verify &gt;
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Workflow Banner Diagram Note */}
          <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-800/40 text-xs text-cyan-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Compass className="w-5 h-5 text-cyan-400 shrink-0" />
              <span>
                <strong>Integrated Pipeline:</strong> Camera + Ultrasonic Sensor → ESP32 → On-Device Triage → Wi-Fi Uplink → Panchayat Dashboard → Field Dispatch.
              </span>
            </div>
            <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2.5 py-1 rounded-lg border border-cyan-400/30 font-mono shrink-0">
              Validated End-to-End
            </span>
          </div>
        </section>
      )}

      {/* Section 2: Hardware Architecture & Deep Dive */}
      {(activeTab === 'all' || activeTab === 'hardware') && (
        <section className="space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-400">
              Low-Cost Student Prototyping
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Hardware Architecture & Component Stack
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-3xl">
              Built using accessible, off-the-shelf maker components. Any engineering student or village IT coordinator can assemble, calibrate, and service the rover locally.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Image Column */}
            <div className="lg:col-span-6">
              <div 
                className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-900 group cursor-pointer shadow-xl"
                onClick={() => setEnlargedImage('/images/drainpulse/hardware_esp32_closeup.jpg')}
              >
                <img 
                  src="/images/drainpulse/hardware_esp32_closeup.jpg" 
                  alt="DrainPulse hardware close-up: ESP32-CAM, ultrasonic sensor, L298N driver and Li-ion pack on workbench"
                  className="w-full h-80 sm:h-96 object-cover group-hover:scale-105 transition duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700 text-[10px] font-mono text-cyan-300">
                  Maker Lab Workbench Prototype
                </div>
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h4 className="text-sm font-bold">DrainPulse Chassis Layout</h4>
                  <p className="text-xs text-slate-300">ESP32-CAM, HC-SR04, L298N Motor Driver, and Dual 18650 Battery Pack.</p>
                </div>
              </div>
            </div>

            {/* Spec Cards Column */}
            <div className="lg:col-span-6 space-y-2.5">
              {hardwareSpecs.map((spec, idx) => (
                <div 
                  key={idx}
                  className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 hover:border-indigo-500/50 transition flex items-start justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white">{spec.name}</span>
                      <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/40">
                        {spec.role}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-snug">
                      {spec.details}
                    </p>
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/40 shrink-0">
                    {spec.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Section 3: Engineering Challenges & Practical Design */}
      {(activeTab === 'all' || activeTab === 'engineering') && (
        <section className="space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400">
              Practical Engineering Realities
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Engineering Challenges in Storm Drains & How We Solved Them
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-3xl">
              Operating inside narrow, subterranean concrete culverts presents severe real-world constraints: moisture, mud, darkness, and RF attenuation. Here is our design breakdown.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Blueprint Schematic Image */}
            <div className="lg:col-span-6 order-2 lg:order-1">
              <div 
                className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-900 group cursor-pointer shadow-xl"
                onClick={() => setEnlargedImage('/images/drainpulse/engineering_design_schematic.jpg')}
              >
                <img 
                  src="/images/drainpulse/engineering_design_schematic.jpg" 
                  alt="DrainPulse technical engineering schematic blueprint breakdown"
                  className="w-full h-80 sm:h-96 object-cover group-hover:scale-105 transition duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700 text-[10px] font-mono text-cyan-300">
                  Exploded View Technical Blueprint
                </div>
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h4 className="text-sm font-bold">Sealed Enclosure & Sensor Placement Blueprint</h4>
                  <p className="text-xs text-slate-300">Gasketed wiring glands, LED illumination angle, and ultrasonic acoustic cone.</p>
                </div>
              </div>
            </div>

            {/* Challenges Cards */}
            <div className="lg:col-span-6 space-y-3 order-1 lg:order-2">
              {engineeringChallenges.map((ch, idx) => (
                <div 
                  key={idx}
                  className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-amber-300 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      {ch.title}
                    </h4>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                      {ch.tag}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    <strong className="text-slate-300">Challenge:</strong> {ch.problem}
                  </p>
                  <p className="text-[11px] text-cyan-300/90 leading-snug">
                    <strong className="text-cyan-400">DrainPulse Solution:</strong> {ch.solution}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Dual Field Inspection Photo Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <div 
              className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 relative group cursor-pointer"
              onClick={() => setEnlargedImage('/images/drainpulse/drain_inspection_waste.jpg')}
            >
              <img 
                src="/images/drainpulse/drain_inspection_waste.jpg" 
                alt="Rover inspecting plastic litter and leaves obstruction in concrete drain"
                className="w-full h-56 object-cover group-hover:scale-105 transition duration-300"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <span className="text-[10px] font-mono text-amber-400 uppercase font-bold block">Observation Field Test</span>
                <h5 className="font-bold text-xs">Visual Debris Clog Identification</h5>
                <p className="text-[11px] text-slate-300">Rover lights illuminate trapped plastic polythene and silt dam.</p>
              </div>
            </div>

            <div 
              className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 relative group cursor-pointer"
              onClick={() => setEnlargedImage('/images/drainpulse/water_level_monitoring.jpg')}
            >
              <img 
                src="/images/drainpulse/water_level_monitoring.jpg" 
                alt="Rover measuring water depth using downward ultrasonic distance sensor"
                className="w-full h-56 object-cover group-hover:scale-105 transition duration-300"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold block">Sensor Telemetry Test</span>
                <h5 className="font-bold text-xs">Ultrasonic Water Level Measurement</h5>
                <p className="text-[11px] text-slate-300">Acoustic distance beam verifies water depth from elevated dry culvert bench.</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Section 4: Rural Panchayat & Agriculture Impact */}
      {(activeTab === 'all' || activeTab === 'impact') && (
        <section className="space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400">
              Community & Governance Value
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Impact on Village & Panchayat Development, Agriculture & Rural Economy
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-3xl">
              DrainPulse addresses the core theme of the Seva First Innovation Challenge by delivering tangible, pro-poor civic technology that protects rural livelihoods and dignity.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Panchayat Control Room Photo */}
            <div className="lg:col-span-5">
              <div 
                className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-900 group cursor-pointer shadow-xl"
                onClick={() => setEnlargedImage('/images/drainpulse/panchayat_control_room.jpg')}
              >
                <img 
                  src="/images/drainpulse/panchayat_control_room.jpg" 
                  alt="Rural village panchayat office showing laptop running DrainPulse dashboard"
                  className="w-full h-80 sm:h-96 object-cover group-hover:scale-105 transition duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700 text-[10px] font-mono text-emerald-300">
                  Village Panchayat Office Integration
                </div>
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h4 className="text-sm font-bold">Panchayat Administration Desktop</h4>
                  <p className="text-xs text-slate-300">Live drain status, culvert cleaning schedule, and community hazard alerts.</p>
                </div>
              </div>
            </div>

            {/* 4 Pillars Matrix */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {impactPillars.map((pillar, idx) => {
                const Icon = pillar.icon;
                return (
                  <div 
                    key={idx}
                    className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-2 hover:border-slate-700 transition flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {pillar.category}
                        </span>
                        <div className={`p-1.5 rounded-lg border ${pillar.color}`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                      </div>
                      <h4 className="font-bold text-xs text-white">{pillar.title}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {pillar.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center gap-1.5 text-[10px] text-emerald-400 font-medium">
                      <CheckCircle className="w-3 h-3 text-emerald-400" />
                      <span>Measurable Civic Outcome</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* CTA Footer Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 text-center space-y-3">
        <h3 className="text-base sm:text-lg font-bold text-white">
          Experience DrainPulse in Action
        </h3>
        <p className="text-xs text-slate-300 max-w-xl mx-auto">
          Explore the live interactive tactical map, inspect culvert camera snapshots, test automated triage rules, or browse verified panchayat safety advisories.
        </p>
        <div className="pt-1 flex flex-wrap justify-center gap-3">
          <button
            onClick={onNavigateToDashboard}
            className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 transition shadow-md shadow-cyan-500/20"
          >
            <span>Open Tactical Rover Dashboard</span>
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={onNavigateToPublic}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs border border-slate-700 transition"
          >
            Open Panchayat Public Portal
          </button>
        </div>
      </div>

      {/* Lightbox Modal for Image Inspection */}
      {enlargedImage && (
        <div 
          className="fixed inset-0 z-[1300] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setEnlargedImage(null)}
        >
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center">
            <img 
              src={enlargedImage} 
              alt="Enlarged DrainPulse Project Asset"
              className="max-h-[85vh] w-auto rounded-2xl shadow-2xl border border-slate-700 object-contain"
            />
            <p className="text-xs text-slate-400 mt-2">Click anywhere to close preview</p>
          </div>
        </div>
      )}
    </div>
  );
};
