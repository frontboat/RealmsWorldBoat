"use client";

import { useTimeDiff } from "@/hooks/useTimeDiff";
import Lords from "@/icons/lords.svg";
import { api } from "@/trpc/react";
import { padAddress } from "@/utils/utils";
import { useAccount } from "@starknet-react/core";
import { Clock } from "lucide-react";

import type { RouterOutputs } from "@realms-world/api";
import { getCollectionFromAddress } from "@realms-world/constants";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
} from "@realms-world/ui";

import { BuyModal } from "../../marketplace/buy/BuyModal";
import TokenOwnerActions from "../../marketplace/TokenOwnerActions";
import { L2ActivityCard } from "../(list)/activity/L2ActivityCard";
import { ListingCard } from "../(list)/ListingCard";

// Component to display information about an L2 token
export const L2Token = ({
  contractAddress,
  tokenId,
  token,
}: {
  contractAddress: string;
  tokenId: string;
  token: RouterOutputs["erc721Tokens"]["byId"];
}) => {
  const { data: erc721Token } = api.erc721Tokens.byId.useQuery(
    {
      id: contractAddress + ":" + tokenId,
    },
    { refetchInterval: 10000, initialData: token },
  );
  const { address } = useAccount();

  // Check if the token information is still loading
  if (!erc721Token) return <div>Token Information Loading</div>;

  // Filter active listings created by the token owner
  const activeListings = erc721Token.listings?.filter(
    (listing) => listing.active && listing.created_by === erc721Token.owner,
  );

  // Find the listing with the lowest price
  const lowestPriceActiveListing = activeListings?.reduce(
    (minPriceListing, currentListing) =>
      (currentListing.price ?? 0) < (minPriceListing?.price ?? 0)
        ? currentListing
        : minPriceListing,
    activeListings[0],
  );

  // Get the collection ID from the contract address
  const collectionId = getCollectionFromAddress(contractAddress);

  // Calculate the time difference between now and the listing expiration
  const expiryDiff = useTimeDiff(lowestPriceActiveListing?.expiration ?? 0);

  // Convert the price to a BigInt if it exists
  const price = lowestPriceActiveListing?.price
    ? BigInt(parseInt(lowestPriceActiveListing?.price || "0")).toString()
    : null;

  return (
    <>
      {/* Display the listing expiration time */}
      {lowestPriceActiveListing?.expiration && (
        <div className="my-2 flex items-center  py-4 text-xs opacity-60">
          <Clock className="mr-2 w-6" />
          <span>Listing ends in {expiryDiff}</span>
        </div>
      )}
      <div className="mt-4 flex flex-wrap items-center justify-between border bg-dark-green p-4">
        <div className="flex flex-wrap gap-x-2 text-lg">
          {/* Display the price if it exists */}
          {price ? (
            <>
              {price && (
                <div className="mb-4 flex w-full gap-x-2">
                  <div className="flex max-w-[140px]">
                    <span className="truncate text-3xl">{price}</span>
                  </div>
                  <Lords className="w-8 fill-current pr-2" />
                </div>
              )}
            </>
          ) : (
            "Not listed"
          )}{" "}
          {/* Display token owner actions if the current user is the token owner */}
          {erc721Token.owner === padAddress(address) ? (
            <TokenOwnerActions token={token} />
          ) : (
            <div>
              {/* Display the buy modal if there is a lowest price active listing */}
              {lowestPriceActiveListing && (
                <BuyModal
                  trigger={
                    <Button className="w-full" size={"lg"}>
                      Buy Now
                    </Button>
                  }
                  token={token}
                  collectionId={collectionId}
                  orderId={0}
                />
              )}
            </div>
          )}
        </div>
      </div>
      <Accordion
        type="multiple"
        defaultValue={["item-1", "item-2"]}
        className=""
      >
        <AccordionItem value="item-1">
          <div className="mt-4 border bg-dark-green px-4">
            <AccordionTrigger className="text-lg">Listings</AccordionTrigger>
            <AccordionContent className="-mt-4 w-full flex-wrap gap-x-2">
              {/* Display active listings */}
              {activeListings.length
                ? activeListings.map((listing, index) => {
                    return (
                      <ListingCard
                        key={index}
                        activity={listing}
                        token={token}
                      />
                    );
                  })
                : "No Active Listings"}
            </AccordionContent>
          </div>
        </AccordionItem>
        <AccordionItem value="item-2">
          <div className="mt-4 border bg-dark-green px-4">
            <AccordionTrigger className="text-lg">
              Token Activity
            </AccordionTrigger>
            <AccordionContent className="-mt-4 w-full flex-wrap gap-x-2">
              {/* Display token activity */}
              {erc721Token.listings.map((listing, index) => {
                return <L2ActivityCard key={index} activity={listing} />;
              })}
            </AccordionContent>
          </div>
        </AccordionItem>
      </Accordion>
    </>
  );
};
