import { Box, Image } from "@chakra-ui/react";
import DescImg from "assets/images/desc.png";
import React from "react";

const Description = () => {
  return (
    <>
      <Image src={DescImg} alt="image" w="100%" h="auto" />
      <Box>
        Totem OS is creating an easy-to-use dashboard for all your Web3 tools
        and management of your digital portfolio. The first tools available will
        have a focus on metaverse integrations and community. The dashboard will
        allow users of all experience levels to sharpen and leverage their
        knowledge of Web3 to make the most of this new era of the internet.
        Totem OS is the operating assembly that will house custom tools curated
        by the Totem team to empower the community with an exceeding array of
        applications, as well as other favorite Web3 tools.
      </Box>
      <Box>
        $CTZN will be the preferred and interoperable token used across the
        entire Totem ecosystem, bringing consumer-friendly solutions to staking,
        spending, access and more. Totem creates dynamic use-cases with
        recognized talent & artists to act as a conduit between humans and the
        blockchain.
      </Box>
      <Box>
        These tools will be the building blocks of Totem OS. But on top of
        creating a platform for growth and evolution, Totem OS will house the
        Xela Earth project (metaverse). This will be the first Axis community
        and toolset, accessible by obtaining a XOiD (Axis Token). This is the
        first interoperable metaverse within Totem, acting as a bridge between
        virtual worlds and making it easier and more seamless than ever to
        manage all of your virtual activities through one secure platform.
      </Box>
    </>
  );
};

export default Description;
