import { findLowestPriceActiveListing } from "@/utils/getters";
import { useAccount } from "@starknet-react/core";

import type { RouterOutputs } from "@realms-world/api";
import { Button } from "@realms-world/ui";
import { padAddress } from "@realms-world/utils";

import { BuyModal } from "../../marketplace/buy/BuyModal";
import { ListModal } from "../../marketplace/list/ListModal";
import { ListingEditModal } from "../../marketplace/listEdit/ListingEditModal";

// Component for rendering actions for a card
export const CardAction = ({
  token,
}: {
  token: RouterOutputs["erc721Tokens"]["all"]["items"][number];
}) => {
  const { address } = useAccount();
  const listing = findLowestPriceActiveListing(token.listings, token.owner);

  return (
    <>
      {/* Render BuyModal if the token is not owned by the current user */}
      {listing && token.owner !== padAddress(address?.toLowerCase()) ? (
        <BuyModal
          trigger={
            <Button className="z-20 flex w-full" size={"lg"}>
              Buy Now
            </Button>
          }
          token={token}
          collectionId={token.contract_address!}
          orderId={0}
        />
      ) : (
        // Render ListingEditModal if the token is owned by the current user
        <ListingEditModal
          token={token}
          collectionId={"test"}
          trigger={
            <Button size={"lg"} className="w-full">
              Edit Listing
            </Button>
          }
        />
      )}
      {/* Render ListModal if the token has no price and is owned by the current user */}
      {!token?.price && token.owner == padAddress(address?.toLowerCase()) && (
        <ListModal
          token={token}
          trigger={
            <Button className="z-20 w-full" size={"lg"}>
              List Item
            </Button>
          }
        />
      )}
    </>
  );
};
