import { NextResponse } from "next/server";
import { db, isDbAvailable } from "@/lib/db";
import { testimonials, type Testimonial } from "@/shared/schema";

type SampleTestimonial = {
  id: number | string;
  customerName: string;
  city: string;
  serviceType: string;
  rating: string;
  testimonial: string;
  createdAt: string;
};

const sampleTestimonials: SampleTestimonial[] = [
  { id: 1, customerName: "Sarah M.", city: "kuna", serviceType: "lawn-mowing", rating: "5", testimonial: "Lawn Care Kuna has been taking care of our yard for 2 years now. Always on time, professional, and our lawn has never looked better!", createdAt: new Date("2024-01-15").toISOString() },
  { id: 2, customerName: "David A.", city: "kuna", serviceType: "spring-cleanup", rating: "5", testimonial: "Amazing spring cleanup service! They removed all the winter debris, cleaned up the flower beds, and got our yard ready for the season.", createdAt: new Date("2024-03-25").toISOString() },
  { id: 3, customerName: "Nancy P.", city: "kuna", serviceType: "fertilization", rating: "5", testimonial: "Our lawn was struggling until we started their fertilization program. Now it's the greenest on the block! Very knowledgeable team.", createdAt: new Date("2024-05-10").toISOString() },
  { id: 4, customerName: "Mike R.", city: "boise", serviceType: "patio-installation", rating: "5", testimonial: "They installed a beautiful patio in our backyard. The crew was professional and the work quality exceeded our expectations.", createdAt: new Date("2024-02-20").toISOString() },
  { id: 5, customerName: "Jennifer K.", city: "boise", serviceType: "christmas-lights", rating: "5", testimonial: "Best Christmas light installation service in the valley! They made our home look amazing for the holidays.", createdAt: new Date("2023-12-10").toISOString() },
  { id: 6, customerName: "Tom H.", city: "boise", serviceType: "irrigation-maintenance", rating: "5", testimonial: "They winterized our sprinkler system and got it running perfectly in spring. Saved us from costly repairs. Highly recommend!", createdAt: new Date("2024-04-08").toISOString() },
  { id: 7, customerName: "Amanda L.", city: "meridian", serviceType: "landscaping", rating: "5", testimonial: "They transformed our backyard with a beautiful landscape design. The attention to detail was impressive. Worth every penny!", createdAt: new Date("2024-02-20").toISOString() },
  { id: 8, customerName: "Chris B.", city: "meridian", serviceType: "aeration", rating: "5", testimonial: "Had my lawn aerated and overseeded. The difference is remarkable! My grass has never been this thick and healthy.", createdAt: new Date("2024-03-05").toISOString() },
  { id: 9, customerName: "Rachel S.", city: "meridian", serviceType: "weed-control", rating: "5", testimonial: "Our lawn was overrun with weeds before we called them. Now it's weed-free and looks incredible. Great ongoing service!", createdAt: new Date("2024-06-15").toISOString() },
  { id: 10, customerName: "Robert W.", city: "eagle", serviceType: "retaining-walls", rating: "5", testimonial: "Beautiful retaining wall that solved our drainage issues and looks fantastic. Professional from start to finish.", createdAt: new Date("2024-03-05").toISOString() },
  { id: 11, customerName: "Karen T.", city: "eagle", serviceType: "hedge-trimming", rating: "5", testimonial: "They keep our hedges perfectly manicured year-round. Always prompt, professional, and the results speak for themselves.", createdAt: new Date("2024-05-22").toISOString() },
  { id: 12, customerName: "Steve M.", city: "eagle", serviceType: "fall-cleanup", rating: "5", testimonial: "Thorough fall cleanup service. They removed all the leaves, cleaned gutters, and prepared our yard for winter. Excellent work!", createdAt: new Date("2024-10-30").toISOString() },
  { id: 13, customerName: "Lisa M.", city: "star", serviceType: "sprinkler-repair", rating: "5", testimonial: "Quick and professional sprinkler repair. They diagnosed the problem immediately and had everything fixed within an hour.", createdAt: new Date("2024-04-12").toISOString() },
  { id: 14, customerName: "Brian C.", city: "star", serviceType: "lawn-mowing", rating: "5", testimonial: "Reliable weekly mowing service. They show up when they say they will and always leave our property looking great.", createdAt: new Date("2024-07-18").toISOString() },
  { id: 15, customerName: "Michelle D.", city: "star", serviceType: "landscape-lighting", rating: "5", testimonial: "Our new landscape lighting is gorgeous! They designed and installed lights that highlight all our best features. Love it!", createdAt: new Date("2024-08-05").toISOString() },
  { id: 16, customerName: "James F.", city: "middleton", serviceType: "lawn-mowing", rating: "5", testimonial: "Been using their services for 3 years now. Consistent quality, fair pricing, and they really care about their customers.", createdAt: new Date("2024-02-28").toISOString() },
  { id: 17, customerName: "Patricia G.", city: "middleton", serviceType: "tree-trimming", rating: "5", testimonial: "They did an excellent job trimming our large oak tree. Very careful work that improved the tree's health and appearance.", createdAt: new Date("2024-06-20").toISOString() },
  { id: 18, customerName: "Mark R.", city: "middleton", serviceType: "snow-removal", rating: "5", testimonial: "Reliable snow removal all winter long. They cleared our driveway early every morning so we could get to work safely.", createdAt: new Date("2024-01-20").toISOString() },
  { id: 19, customerName: "Susan E.", city: "kuna", serviceType: "overseeding", rating: "5", testimonial: "Our patchy lawn is now thick and lush thanks to their overseeding service. The results exceeded our expectations!", createdAt: new Date("2024-09-10").toISOString() },
  { id: 20, customerName: "Daniel K.", city: "boise", serviceType: "sprinkler-installation", rating: "5", testimonial: "Professional sprinkler system installation. They designed an efficient system that keeps our whole yard perfectly watered.", createdAt: new Date("2024-05-15").toISOString() },
  { id: 21, customerName: "Emily N.", city: "meridian", serviceType: "christmas-lights", rating: "5", testimonial: "Made the holidays so much easier! Beautiful lights, professional installation, and they took care of everything.", createdAt: new Date("2023-12-15").toISOString() },
  { id: 22, customerName: "Greg P.", city: "eagle", serviceType: "lawn-mowing", rating: "5", testimonial: "Top-notch lawn care service. Our property always looks professionally maintained. Couldn't be happier!", createdAt: new Date("2024-07-25").toISOString() },
  { id: 23, customerName: "Laura H.", city: "star", serviceType: "landscaping", rating: "5", testimonial: "They completely redesigned our front yard. The curb appeal is incredible now. Neighbors keep asking who did the work!", createdAt: new Date("2024-04-20").toISOString() },
  { id: 24, customerName: "Kevin O.", city: "middleton", serviceType: "spring-cleanup", rating: "5", testimonial: "Fast, thorough spring cleanup. They had our whole property looking pristine in just a few hours. Great value!", createdAt: new Date("2024-03-18").toISOString() },
  { id: 25, customerName: "Angela W.", city: "kuna", serviceType: "lawn-mowing", rating: "5", testimonial: "We switched to Lawn Care Kuna last summer and the difference is night and day. Our yard looks like a golf course now. The crew is friendly and efficient.", createdAt: new Date("2024-06-12").toISOString() },
  { id: 26, customerName: "Rick D.", city: "kuna", serviceType: "irrigation-maintenance", rating: "5", testimonial: "They found a leak in our irrigation system that our previous company missed for months. Fixed it quickly and saved us a fortune on water bills.", createdAt: new Date("2024-04-22").toISOString() },
  { id: 27, customerName: "Heather L.", city: "kuna", serviceType: "landscaping", rating: "5", testimonial: "From the initial design consultation to the final walkthrough, everything was first class. Our backyard is now our favorite room.", createdAt: new Date("2024-07-08").toISOString() },
  { id: 28, customerName: "Tony V.", city: "kuna", serviceType: "fence-installation", rating: "4", testimonial: "Solid fence installation work. The crew was professional and the fence looks great. Minor scheduling delay but the end result was worth the wait.", createdAt: new Date("2024-08-15").toISOString() },
  { id: 29, customerName: "Carmen J.", city: "boise", serviceType: "lawn-mowing", rating: "5", testimonial: "Hands down the most reliable lawn service in Boise. They have mowed our lawn every week for two seasons and never missed a single visit.", createdAt: new Date("2024-06-28").toISOString() },
  { id: 30, customerName: "Paul T.", city: "boise", serviceType: "landscaping", rating: "5", testimonial: "We hired them for a complete front yard renovation and the transformation is stunning. They worked with our budget and delivered beyond what we imagined.", createdAt: new Date("2024-05-20").toISOString() },
  { id: 31, customerName: "Diane S.", city: "boise", serviceType: "weed-control", rating: "5", testimonial: "After one season of their weed treatment program, our lawn is completely weed-free. The technician explained every step of the process. Very professional.", createdAt: new Date("2024-07-14").toISOString() },
  { id: 32, customerName: "Nathan B.", city: "boise", serviceType: "fall-cleanup", rating: "4", testimonial: "They handled our fall cleanup with a large crew and finished in half the time I expected. Yard looked spotless. Will definitely book again this year.", createdAt: new Date("2024-11-05").toISOString() },
  { id: 33, customerName: "Melissa C.", city: "meridian", serviceType: "lawn-mowing", rating: "5", testimonial: "Professional crew, consistent results, and their attention to edging and trimming sets them apart from others we have tried.", createdAt: new Date("2024-08-02").toISOString() },
  { id: 34, customerName: "Jason R.", city: "meridian", serviceType: "patio-installation", rating: "5", testimonial: "They built us a gorgeous stone patio with a fire pit area. The craftsmanship is outstanding and it has become our favorite gathering spot.", createdAt: new Date("2024-06-18").toISOString() },
  { id: 35, customerName: "Stephanie A.", city: "meridian", serviceType: "fertilization", rating: "5", testimonial: "Started their fertilization plan in early spring and by summer our grass was the darkest green on the street. The neighbors noticed the difference right away.", createdAt: new Date("2024-07-30").toISOString() },
  { id: 36, customerName: "Craig W.", city: "meridian", serviceType: "sprinkler-repair", rating: "4", testimonial: "Called them for an emergency sprinkler line break and they came out the same day. Fixed the problem and adjusted our zones for better coverage. Great service.", createdAt: new Date("2024-05-28").toISOString() },
  { id: 37, customerName: "Teresa M.", city: "eagle", serviceType: "landscaping", rating: "5", testimonial: "We asked for a low-maintenance landscape design and they delivered perfectly. Native plants, smart irrigation, and it looks beautiful year-round.", createdAt: new Date("2024-04-15").toISOString() },
  { id: 38, customerName: "Derek H.", city: "eagle", serviceType: "christmas-lights", rating: "5", testimonial: "Third year in a row using them for Christmas lights. They store our lights, install them professionally, and take them down after the holidays. So convenient.", createdAt: new Date("2023-12-22").toISOString() },
  { id: 39, customerName: "Valerie F.", city: "eagle", serviceType: "spring-cleanup", rating: "5", testimonial: "They did a complete spring cleanup of our half-acre property in one morning. Flower beds cleaned, debris hauled away, everything looking fresh.", createdAt: new Date("2024-03-28").toISOString() },
  { id: 40, customerName: "Scott L.", city: "eagle", serviceType: "aeration", rating: "4", testimonial: "Had our lawn aerated for the first time and already seeing improvement. They explained the process well and worked quickly. Will do this annually now.", createdAt: new Date("2024-09-15").toISOString() },
  { id: 41, customerName: "Brenda K.", city: "star", serviceType: "fertilization", rating: "5", testimonial: "The custom fertilization schedule they created for our clay soil has worked wonders. Our lawn went from thin and patchy to thick and vibrant.", createdAt: new Date("2024-06-22").toISOString() },
  { id: 42, customerName: "Roger N.", city: "star", serviceType: "tree-trimming", rating: "5", testimonial: "They carefully trimmed our mature maple trees and cleaned up every branch and leaf. The trees look healthier and our yard gets much better sunlight now.", createdAt: new Date("2024-07-10").toISOString() },
  { id: 43, customerName: "Cindy P.", city: "star", serviceType: "weed-control", rating: "5", testimonial: "Within three treatments our lawn went from full of dandelions to completely clean. They use effective products and follow a smart schedule.", createdAt: new Date("2024-05-18").toISOString() },
  { id: 44, customerName: "Howard G.", city: "star", serviceType: "snow-removal", rating: "4", testimonial: "Dependable snow removal service through a tough Idaho winter. They were always there before sunrise so we could get out of the driveway on time.", createdAt: new Date("2024-01-30").toISOString() },
  { id: 45, customerName: "Wendy R.", city: "middleton", serviceType: "landscaping", rating: "5", testimonial: "They designed a beautiful pathway with landscaping around it. The combination of pavers, plants, and lighting created an inviting entrance to our home.", createdAt: new Date("2024-08-20").toISOString() },
  { id: 46, customerName: "Frank B.", city: "middleton", serviceType: "lawn-mowing", rating: "5", testimonial: "Switched from doing it ourselves to hiring them and honestly wish we had done it sooner. The time savings alone is worth it, and the results are way better.", createdAt: new Date("2024-07-05").toISOString() },
  { id: 47, customerName: "Rita C.", city: "middleton", serviceType: "hedge-trimming", rating: "5", testimonial: "Our overgrown hedges look amazing now. They shaped them perfectly and even removed several dead sections. Very skilled and careful team.", createdAt: new Date("2024-06-08").toISOString() },
  { id: 48, customerName: "Allen J.", city: "middleton", serviceType: "irrigation-maintenance", rating: "4", testimonial: "They did a full sprinkler system tune-up and found two broken heads I did not know about. System runs much more efficiently now. Fair pricing too.", createdAt: new Date("2024-04-28").toISOString() },
  { id: 49, customerName: "Dorothy S.", city: "kuna", serviceType: "christmas-lights", rating: "5", testimonial: "Our house looked absolutely magical this Christmas. The design they suggested was elegant and tasteful. Even the delivery drivers were complimenting our display.", createdAt: new Date("2023-12-20").toISOString() },
  { id: 50, customerName: "Gary M.", city: "kuna", serviceType: "retaining-walls", rating: "5", testimonial: "The retaining wall they built solved our erosion problem completely. It has been through two heavy rain seasons and still looks perfect. Quality craftsmanship.", createdAt: new Date("2024-09-05").toISOString() },
  { id: 51, customerName: "Helen A.", city: "boise", serviceType: "hedge-trimming", rating: "5", testimonial: "We have over 200 feet of hedges and they tackle the job efficiently every time. Clean cuts, proper shaping, and they always clean up after themselves.", createdAt: new Date("2024-08-12").toISOString() },
  { id: 52, customerName: "Wayne D.", city: "boise", serviceType: "aeration", rating: "5", testimonial: "Had our lawn aerated and overseeded in the fall and the following spring was the best our lawn has ever looked. They know exactly what Idaho lawns need.", createdAt: new Date("2024-10-08").toISOString() },
  { id: 53, customerName: "Judith L.", city: "meridian", serviceType: "landscape-lighting", rating: "5", testimonial: "The landscape lighting they installed transformed our yard at night. The uplighting on our trees creates such a beautiful ambiance. We get compliments constantly.", createdAt: new Date("2024-09-20").toISOString() },
  { id: 54, customerName: "Phil W.", city: "meridian", serviceType: "fence-installation", rating: "5", testimonial: "Installed a cedar privacy fence around our entire property. The quality of materials and workmanship are excellent. It really completed our outdoor space.", createdAt: new Date("2024-07-22").toISOString() },
  { id: 55, customerName: "Donna H.", city: "eagle", serviceType: "irrigation-maintenance", rating: "5", testimonial: "They manage our entire irrigation system. Spring startup, mid-season adjustments, and winterization. Our water usage dropped 30% with their smart scheduling.", createdAt: new Date("2024-06-02").toISOString() },
  { id: 56, customerName: "Martin K.", city: "star", serviceType: "patio-installation", rating: "5", testimonial: "Absolutely love our new paver patio. The design was creative, the materials are high quality, and the installation was done in just three days. Highly recommend.", createdAt: new Date("2024-08-28").toISOString() },
  { id: 57, customerName: "Barbara T.", city: "middleton", serviceType: "christmas-lights", rating: "5", testimonial: "First time hiring a professional for our holiday lights and it was the best decision. Stress-free, beautiful results, and safe installation on our two-story home.", createdAt: new Date("2023-12-08").toISOString() },
  { id: 58, customerName: "Kenneth E.", city: "kuna", serviceType: "lawn-maintenance", rating: "5", testimonial: "Complete lawn maintenance package has been a game changer for us. Mowing, edging, trimming, blowing -- they handle it all and our yard looks pristine.", createdAt: new Date("2024-08-08").toISOString() },
  { id: 59, customerName: "Joyce V.", city: "boise", serviceType: "spring-cleanup", rating: "4", testimonial: "Great spring cleanup service. The crew was thorough and had our large property cleaned up in a single day. Nice to have the yard looking fresh for spring.", createdAt: new Date("2024-03-22").toISOString() },
  { id: 60, customerName: "Ray F.", city: "meridian", serviceType: "snow-removal", rating: "5", testimonial: "They plowed our commercial lot reliably all winter. Never had a single complaint from tenants about ice or snow. That kind of consistency is hard to find.", createdAt: new Date("2024-02-10").toISOString() },
  { id: 61, customerName: "Linda Q.", city: "eagle", serviceType: "pond-installation", rating: "5", testimonial: "They built a gorgeous koi pond in our backyard with a waterfall feature. The sound of running water is so relaxing. Best investment we have made in our property.", createdAt: new Date("2024-06-25").toISOString() },
  { id: 62, customerName: "Harold J.", city: "meridian", serviceType: "pond-installation", rating: "5", testimonial: "Our new garden pond with aquatic plants looks incredible. They handled everything from excavation to filtration setup. Very knowledgeable about water features.", createdAt: new Date("2024-07-15").toISOString() },
  { id: 63, customerName: "Carol S.", city: "kuna", serviceType: "pond-installation", rating: "4", testimonial: "Beautiful pond installation with natural stone edging. They guided us through plant and fish selection too. The whole family enjoys spending time by the water.", createdAt: new Date("2024-08-10").toISOString() },

  { id: 64, customerName: "Gloria B.", city: "boise", serviceType: "pond-installation", rating: "5", testimonial: "The water feature they designed for our side yard is breathtaking. Layered stones, a small waterfall, and even lighting for evenings. It has transformed our space.", createdAt: new Date("2024-05-30").toISOString() },
  { id: 65, customerName: "Trevor H.", city: "meridian", serviceType: "pond-installation", rating: "5", testimonial: "We went with a medium-size koi pond and they handled every step professionally. The filtration system works flawlessly and the fish are thriving.", createdAt: new Date("2024-09-02").toISOString() },
  { id: 66, customerName: "Monica R.", city: "star", serviceType: "pond-installation", rating: "5", testimonial: "Our backyard pond is the centerpiece of our landscape now. Friends ask about it every time they visit. Installation was cleaner than I expected.", createdAt: new Date("2024-07-20").toISOString() },
  { id: 67, customerName: "Douglas P.", city: "eagle", serviceType: "pond-installation", rating: "5", testimonial: "They took time to explain maintenance, winter care, and pump options. The pond has been trouble-free and looks natural, like it was always there.", createdAt: new Date("2024-08-22").toISOString() },
  { id: 68, customerName: "Priscilla N.", city: "kuna", serviceType: "pond-installation", rating: "5", testimonial: "Loved working with their water feature team. They suggested a bubbling rock that works perfectly with our smaller yard. Soothing and beautiful.", createdAt: new Date("2024-06-05").toISOString() },
  { id: 69, customerName: "Eric L.", city: "middleton", serviceType: "pond-installation", rating: "4", testimonial: "Great pond build with a nice stream feature. Took a little longer than quoted due to weather, but the final result is exactly what we wanted.", createdAt: new Date("2024-09-18").toISOString() },
  { id: 70, customerName: "Sheila G.", city: "boise", serviceType: "pond-installation", rating: "5", testimonial: "Our pondless waterfall is amazing. Low maintenance and gives all the ambience of a pond without the upkeep. The rock selection they used looks so natural.", createdAt: new Date("2024-07-28").toISOString() },

  { id: 71, customerName: "Russell T.", city: "kuna", serviceType: "patio-installation", rating: "5", testimonial: "Our new paver patio turned out better than the renderings. Clean lines, solid base work, and they finished on schedule even with a rainy week in the middle.", createdAt: new Date("2024-05-12").toISOString() },
  { id: 72, customerName: "Beth C.", city: "eagle", serviceType: "patio-installation", rating: "5", testimonial: "They built a large flagstone patio with a seating wall. The materials were top quality and the crew was respectful of our property. Couldn't be happier.", createdAt: new Date("2024-06-30").toISOString() },
  { id: 73, customerName: "Ivan D.", city: "boise", serviceType: "patio-installation", rating: "5", testimonial: "Patio looks like something out of a magazine. They nailed the layout around our existing trees and the drainage works perfectly.", createdAt: new Date("2024-09-08").toISOString() },
  { id: 74, customerName: "Tanya Z.", city: "middleton", serviceType: "patio-installation", rating: "4", testimonial: "Good patio installation with a nice border detail. One paver needed to be replaced after a month and they came back quickly to fix it. Stand-up team.", createdAt: new Date("2024-08-02").toISOString() },
  { id: 75, customerName: "Jerome A.", city: "meridian", serviceType: "patio-installation", rating: "5", testimonial: "Built us a stamped concrete patio with a beautiful finish. They handled the permits and inspection without us lifting a finger. True turnkey service.", createdAt: new Date("2024-05-05").toISOString() },
  { id: 76, customerName: "Kathleen S.", city: "star", serviceType: "patio-installation", rating: "5", testimonial: "Our backyard was unusable before they installed the patio. Now it is the favorite spot in the whole house. Quality from the first shovel to the final sweep.", createdAt: new Date("2024-07-12").toISOString() },
  { id: 77, customerName: "Victor H.", city: "boise", serviceType: "patio-installation", rating: "5", testimonial: "They even helped us pick out outdoor furniture after the patio was done. Above and beyond service, and the installation itself was flawless.", createdAt: new Date("2024-06-10").toISOString() },

  { id: 78, customerName: "Natalie W.", city: "boise", serviceType: "fence-installation", rating: "5", testimonial: "Cedar privacy fence along the full back of our property. Posts were set deep, gates are square and smooth, and the whole project was done in three days.", createdAt: new Date("2024-05-22").toISOString() },
  { id: 79, customerName: "Curtis M.", city: "meridian", serviceType: "fence-installation", rating: "5", testimonial: "They installed a vinyl fence with perfect alignment even across our uneven yard. The gate hardware is heavy-duty and the fence looks clean and modern.", createdAt: new Date("2024-06-14").toISOString() },
  { id: 80, customerName: "Erin V.", city: "eagle", serviceType: "fence-installation", rating: "5", testimonial: "Beautiful split-rail fence around our horse pasture. Sturdy, properly braced, and they worked around our animals without issue. True professionals.", createdAt: new Date("2024-07-02").toISOString() },
  { id: 81, customerName: "Brandon F.", city: "star", serviceType: "fence-installation", rating: "5", testimonial: "Replaced our old chain link with a cedar privacy fence. Hauled away all the old material and left the yard cleaner than when they started. Highly recommend.", createdAt: new Date("2024-08-18").toISOString() },
  { id: 82, customerName: "Shannon O.", city: "middleton", serviceType: "fence-installation", rating: "4", testimonial: "Solid fence build with great wood quality. Had to wait a couple extra weeks for scheduling but once they started, it was finished quickly and correctly.", createdAt: new Date("2024-09-05").toISOString() },
  { id: 83, customerName: "Leonard P.", city: "kuna", serviceType: "fence-installation", rating: "5", testimonial: "Our new fence added instant curb appeal and privacy. They suggested a top cap detail that looks fantastic. Professional crew from start to finish.", createdAt: new Date("2024-06-18").toISOString() },
  { id: 84, customerName: "Mallory R.", city: "boise", serviceType: "fence-installation", rating: "5", testimonial: "Double-gate installation for RV access came out perfectly. They measured twice, set the posts in concrete, and the gates swing effortlessly even after a winter.", createdAt: new Date("2024-04-25").toISOString() },
  { id: 85, customerName: "Preston K.", city: "meridian", serviceType: "fence-installation", rating: "5", testimonial: "Happy with the aluminum fence they installed around the pool. Code-compliant, clean welds, and it complements the landscaping beautifully.", createdAt: new Date("2024-07-28").toISOString() },

  { id: 86, customerName: "Olivia G.", city: "kuna", serviceType: "irrigation-maintenance", rating: "5", testimonial: "Annual sprinkler tune-up revealed a clogged valve and two misaligned heads. Fixed in one visit and our water bill dropped the next month.", createdAt: new Date("2024-05-04").toISOString() },
  { id: 87, customerName: "Sam R.", city: "boise", serviceType: "irrigation-maintenance", rating: "5", testimonial: "They winterized and then started my system in the spring with zero leaks. The whole crew clearly knows Idaho irrigation inside and out.", createdAt: new Date("2024-04-02").toISOString() },
  { id: 88, customerName: "Alyssa P.", city: "meridian", serviceType: "irrigation-maintenance", rating: "4", testimonial: "Quick response for a broken lateral line. Dug, repaired, and restored the sod all in the same afternoon. The only reason for 4 stars is the earlier arrival window.", createdAt: new Date("2024-06-08").toISOString() },
  { id: 89, customerName: "Gordon N.", city: "star", serviceType: "irrigation-maintenance", rating: "5", testimonial: "Tuned up an old system and got it running better than it has in years. They replaced a few nozzles and the coverage is finally even across the yard.", createdAt: new Date("2024-05-26").toISOString() },
  { id: 90, customerName: "Bethany S.", city: "eagle", serviceType: "irrigation-maintenance", rating: "5", testimonial: "Converted our old controller to a smart one and it has been fantastic. They walked me through the app and even tweaked the schedule for our plant types.", createdAt: new Date("2024-07-11").toISOString() },
  { id: 91, customerName: "Lloyd K.", city: "middleton", serviceType: "irrigation-maintenance", rating: "5", testimonial: "Sprinkler blowout was fast and thorough. They checked every zone and pointed out a leaky backflow that would have been a mess in spring. Great attention to detail.", createdAt: new Date("2024-10-22").toISOString() },
  { id: 92, customerName: "Felicia C.", city: "kuna", serviceType: "irrigation-maintenance", rating: "5", testimonial: "Our lawn had dry spots for years. They re-engineered a few zones and now coverage is consistent. Worth every penny to finally have a healthy green lawn.", createdAt: new Date("2024-06-16").toISOString() },

  { id: 93, customerName: "Marcus J.", city: "kuna", serviceType: "lawn-maintenance", rating: "5", testimonial: "Full-service lawn maintenance has freed up our weekends. Mowing, trimming, and edging every week and the yard always looks sharp when we pull in.", createdAt: new Date("2024-06-04").toISOString() },
  { id: 94, customerName: "Regina T.", city: "boise", serviceType: "lawn-maintenance", rating: "5", testimonial: "I wish we had hired them years ago. The weekly maintenance package keeps everything neat and they catch small issues before they become big problems.", createdAt: new Date("2024-07-09").toISOString() },
  { id: 95, customerName: "Dwayne C.", city: "meridian", serviceType: "lawn-maintenance", rating: "5", testimonial: "Reliable, professional, and reasonably priced. Our ongoing lawn maintenance has turned our yard into the nicest one on the cul-de-sac.", createdAt: new Date("2024-08-14").toISOString() },
  { id: 96, customerName: "Hannah M.", city: "eagle", serviceType: "lawn-maintenance", rating: "5", testimonial: "The consistency is what I appreciate most. Same crew, same day every week, and the yard is always finished to the same high standard.", createdAt: new Date("2024-05-28").toISOString() },
  { id: 97, customerName: "Austin B.", city: "star", serviceType: "lawn-maintenance", rating: "4", testimonial: "Happy with the ongoing lawn maintenance plan. They handle mowing, edging, and blowing off the driveway every visit. Rarely have to think about the yard anymore.", createdAt: new Date("2024-07-22").toISOString() },
  { id: 98, customerName: "Carla D.", city: "middleton", serviceType: "lawn-maintenance", rating: "5", testimonial: "Signed up for the seasonal maintenance plan and it has been hands-off for us. Everything gets done on time and the crew is polite and efficient.", createdAt: new Date("2024-08-30").toISOString() },
  { id: 99, customerName: "Grant W.", city: "boise", serviceType: "lawn-maintenance", rating: "5", testimonial: "Great lawn maintenance service. They noticed a sprinkler head issue during a mowing visit and let us know right away. That kind of proactive attention is rare.", createdAt: new Date("2024-06-22").toISOString() },
  { id: 100, customerName: "Yvonne H.", city: "kuna", serviceType: "lawn-maintenance", rating: "5", testimonial: "Their lawn maintenance program includes everything we needed in one package. Simple billing, consistent results, and a crew that clearly takes pride in their work.", createdAt: new Date("2024-09-12").toISOString() },
  { id: 101, customerName: "Brett E.", city: "meridian", serviceType: "lawn-maintenance", rating: "5", testimonial: "Our HOA requires a tidy yard and these guys keep us well ahead of any violation letters. Responsive, flexible, and professional every time.", createdAt: new Date("2024-07-16").toISOString() },

  { id: 102, customerName: "Maggie L.", city: "boise", serviceType: "lawn-mowing", rating: "5", testimonial: "Weekly mowing has been flawless. Crisp stripes, clean edges, and they always leave the driveway blown clean. It is a small thing that makes a big difference.", createdAt: new Date("2024-08-06").toISOString() },
  { id: 103, customerName: "Clinton Y.", city: "meridian", serviceType: "lawn-mowing", rating: "4", testimonial: "Dependable mowing service, even during the rainy stretches. They adjust cutting height seasonally which really helps the lawn bounce back after summer heat.", createdAt: new Date("2024-06-18").toISOString() },
  { id: 104, customerName: "Vanessa O.", city: "kuna", serviceType: "lawn-mowing", rating: "5", testimonial: "Switched mowing services last year and the difference is obvious. These guys are faster, neater, and communicate well if anything changes with the schedule.", createdAt: new Date("2024-07-30").toISOString() },

  { id: 105, customerName: "Herbert F.", city: "boise", serviceType: "christmas-lights", rating: "5", testimonial: "From design to takedown, the Christmas light service was effortless. The LED bulbs they use are brighter and cleaner than anything we ever hung ourselves.", createdAt: new Date("2023-12-02").toISOString() },
  { id: 106, customerName: "Renee P.", city: "star", serviceType: "christmas-lights", rating: "5", testimonial: "They installed lights on the house, trees, and even around our garden arch. Looked like a holiday card every night coming home. Already on the list for next year.", createdAt: new Date("2023-12-12").toISOString() },
  { id: 107, customerName: "Omar G.", city: "kuna", serviceType: "christmas-lights", rating: "5", testimonial: "Safe, clean installation on our two-story home. They used custom-cut strands so there were no dangling ends anywhere. Truly professional holiday lighting.", createdAt: new Date("2023-11-28").toISOString() },
  { id: 108, customerName: "Josie A.", city: "eagle", serviceType: "christmas-lights", rating: "4", testimonial: "Great holiday light service with a nice warm-white look. One strand needed replacing mid-December and they came out the next morning to swap it out.", createdAt: new Date("2023-12-18").toISOString() },

  { id: 109, customerName: "Trent S.", city: "kuna", serviceType: "landscaping", rating: "5", testimonial: "Full landscape redesign with new beds, trees, and sod. The plan they drew up was thoughtful and the final yard is even better than the renderings.", createdAt: new Date("2024-05-15").toISOString() },
  { id: 110, customerName: "Marissa K.", city: "boise", serviceType: "landscaping", rating: "5", testimonial: "They turned an empty side yard into a beautiful garden path with lighting. So many small design touches that make the space feel intentional and peaceful.", createdAt: new Date("2024-06-20").toISOString() },
  { id: 111, customerName: "Dale R.", city: "middleton", serviceType: "landscaping", rating: "5", testimonial: "Front yard landscaping was done exactly to plan and on time. The new plantings are thriving and the drip irrigation they added is a huge water-saver.", createdAt: new Date("2024-07-25").toISOString() },
  { id: 112, customerName: "Whitney B.", city: "eagle", serviceType: "landscaping", rating: "4", testimonial: "Happy with the backyard landscape install. A couple of plants needed replacing after the first month and they swapped them without a fuss. Great follow-through.", createdAt: new Date("2024-08-10").toISOString() },
];

function normalizeDbRow(r: Testimonial): SampleTestimonial {
  return {
    id: r.id,
    customerName: r.customerName,
    city: r.city,
    serviceType: r.serviceType,
    rating: r.rating,
    testimonial: r.testimonial,
    createdAt: (() => {
      try {
        const d = r.createdAt instanceof Date ? r.createdAt : r.createdAt ? new Date(r.createdAt) : null;
        if (d && !isNaN(d.getTime())) return d.toISOString();
      } catch {}
      return new Date().toISOString();
    })(),
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceType = searchParams.get("serviceType") || searchParams.get("service");
    const limit = parseInt(searchParams.get("limit") || "60");
    const minThreshold = 8;

    let dbRows: SampleTestimonial[] = [];
    if (isDbAvailable() && db) {
      try {
        const rows: Testimonial[] = await db.select().from(testimonials);
        dbRows = rows
          .filter((r) => typeof r.testimonial === "string" && r.testimonial.length > 0)
          .map(normalizeDbRow);
      } catch (err) {
        console.error("Error reading testimonials from DB:", err);
        dbRows = [];
      }
    }

    const seen = new Set<string>();
    const dedupe = (list: SampleTestimonial[]) => {
      const out: SampleTestimonial[] = [];
      for (const t of list) {
        const key = `${t.customerName}|${t.testimonial}`;
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(t);
      }
      return out;
    };

    const combined = dedupe([...dbRows, ...sampleTestimonials]);

    let result: SampleTestimonial[];
    if (serviceType) {
      const matching = combined.filter((t) => t.serviceType === serviceType);
      if (matching.length >= minThreshold) {
        result = matching;
      } else {
        const fillers = combined.filter((t) => t.serviceType !== serviceType);
        result = [...matching, ...fillers];
      }
    } else {
      result = combined;
    }

    if (result.length === 0) {
      result = sampleTestimonials;
    }

    return NextResponse.json(result.slice(0, limit));
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    return NextResponse.json(sampleTestimonials);
  }
}
