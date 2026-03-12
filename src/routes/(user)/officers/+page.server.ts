import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  // Sample officer data - replace with actual data from database or API
  const officers = [
    {
      image: '/malik.png', // Add actual image paths
      name: 'Mujtaba Malik',
      position: 'President',
      description: `Hi everyone, I'm Mujtaba Malik, I just go by Malik, and I've got to witness this club rise from the grave in 2023 as well as play a part in helping it regain its standing in 2024. This year, I plan to keep that momentum going to make the Google Developer Community at Louisiana stronger than it has ever been with the help of some amazing and talented officers who are devoted to pushing the club even further. `
    },
    {
      image: '/lily.png',
      name: 'Lillian Holliday',
      position: 'Vice President',
      description: `Hi everyone! I'm Lillian Holliday, the Vice President of GDSC. My role is to support the president and help make sure everything in the club runs smoothly, from meetings to events. I enjoy working with the officer team to bring new ideas and opportunities to our members. I'm passionate about technology, learning new things, and helping create a welcoming community where students can collaborate, build projects, and grow together.`
    },
    {
      image: '/trenton.png',
      name: 'Trenton Hew',
      position: 'Secretary',
      description: `Hey everyone, I'm Trenton Hew and I serve as the Secretary for GDSC. I help organize meetings, coordinate events, and keep track of everything happening within the club. I'm excited to help plan activities that bring people together to learn more about development and technology. Outside of GDSC, I enjoy exploring new tech, learning new skills, and working on projects that challenge me.`
    },
    {
      image: '/daniel.png',
      name: 'Daniel Guo',
      position: 'Treasurer',
      description: `I'm Daniel Guo, a new recruit of GDSC and hopefully will play a part in making GDSC a stronger community in 2026. I love coding, sports, watching dramas/anime, and like dreaming to be rich. If you have any question please reach out to any of us.`
    },
    {
      image: '/thomas.png',
      name: 'Thomas Lee',
      position: 'PR Manager',
      description: `Hi everyone, Im Thomas Lee, I just go by Thomas, and I got to play a part in helping GDSC regain its standing in 2025. This year, I want to become a better PR manager, and grow this club through the lenses of media. I love watching movies, editing videos, judo, and dreaming.`
    },
    {
      image: '/quentin.png',
      name: 'Quentin Bordelon',
      position: 'Webmaster',
      description: `Hi! I'm Quentin Bordelon, the Webmaster for GDSC. I help manage and maintain the club's website and technical resources so our members can stay connected and informed about upcoming events and opportunities. I enjoy working on web development projects and learning new technologies, and I'm excited to help build tools that make the club even better for everyone involved.`
    },
    {
      image: '/dina.png',
      name: 'Dina Tiang',
      position: 'Senior Advisor',
      description: `Hi everyone, I'm Dina Tiang, serving as a Senior Advisor for GDSC. My role is to help guide the officer team and support the club as it continues to grow and improve. I've been involved with the community and enjoy helping others learn, collaborate, and develop their skills in technology. I'm excited to see what new ideas and projects our members bring to the club this year.`
    },
    {
      image: '/william.png',
      name: 'William Bradford',
      position: 'Junior Webmaster',
      description: `Hey! I'm William Bradford, the Junior Webmaster for GDSC. I help work on the club's website and technical projects alongside the webmaster while continuing to develop my skills in programming and web development. I'm interested in computer science and enjoy building things with code, learning new technologies, and contributing to projects that help the club grow.`
    },
    {
      image: '/zachary.png',
      name: 'Zachary Zhuo',
      position: 'Junior Historian',
      description: `I'm Zac, your Historian and Photographer. While my Electrical Engineering studies keep me busy, my role at GDSC is to capture the human side of technology. I document our journey, making sure every moment of our club's legacy is captured. I love seeing the spark of innovation firsthand, and making sure it's framed perfectly!`
    },
    {
      image: '/evan.png',
      name: 'Evan Voisel',
      position: 'Junior Officer',
      description: `Hi, I'm Evan Voisel and I'm a Junior Officer for GDSC. I help support the officer team with events, meetings, and different club activities throughout the year. I'm excited to be involved in a community that brings together students interested in technology and development, and I'm looking forward to helping create events where people can learn, collaborate, and build cool things together.`
    },
    {
      image: '/thar.png',
      name: 'Thar Htoo',
      position: 'Junior Outreach',
      description: `Hi everyone! I'm Thar Htoo and I serve as the Junior Outreach officer for GDSC. My role is to help connect the club with students and the wider community, spreading the word about our events and opportunities. I'm excited to help grow the club and bring more people into the world of technology, collaboration, and innovation.`
    }
  ];

  return {
    officers
  };
};