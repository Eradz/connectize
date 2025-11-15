import { ShareAltOutlined } from "@ant-design/icons";
import React from "react";
import { useProductImages } from "../../../hooks/useProduct";
import { Heart, StarFilledIcon, StarOutlinedIcon } from "../../../icon";
import { formatNumber, shareThis } from "../../../lib/utils";
import LightParagraph from "../../ParagraphText";
import ProfileSection from "../../userProfile/profile-section";
import { ButtonWithTooltipIcon } from "../../ButtonWithTooltipIcon";
import { Link } from "react-router-dom";

const ListedProducts = ({ company }) => {
  return (
    <ProfileSection>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xl md:text-lg font-semibold">Listed Products</h4>
        {/* <MoreOptions>
          <div>more options</div>
        </MoreOptions> */}
      </div>
      <section className="space-y-4">
        {company.products.length <= 0 ? (
          <LightParagraph>No product yet...</LightParagraph>
        ) : (
          company.products.map((product) => {
            return (
              <ListedProduct
                key={product.id}
                title={product.title}
                likes={product.likes.length || "0"}
                image={product?.images?.[0]?.image}
                id={product.id}
              />
            );
          })
        )}
      </section>

      {company?.products?.length ? (
        <Link
          to={`/market?company=${company.id}---${company.slug}`}
          className="mt-10 flex justify-center"
        >
          View more
        </Link>
      ) : null}
    </ProfileSection>
  );
};

function ListedProduct({ id, title, likes, image }) {
  // const { productImage } = useProductImages(id);
  return (
    <div className="bg-background p-2.5 rounded-md flex max-sm:flex-col gap-2 sm:gap-4 relative">
      <picture className="bg-white sm:w-1/3 p-2 sm:p-1 sm:h-fit flex">
        <Link to={"/products/" + id} className="w-full">
          <img
            src={image}
            className="max-h-40 sm:w-full object-cover rounded-md mx-auto"
            alt={title || "No title"}
          />
        </Link>
      </picture>

      <div className="sm:w-2/3">
        <Link
          to={"/products/" + id}
          className="sm:flex justify-between items-start border-b pb-2 pt-2"
        >
          <h4 className="max-md:text-xl font-bold">{title || ""}</h4>
          {/* <div className="max-md:absolute top-4 right-4">
            <MoreOptions>
              <div>more options</div>
            </MoreOptions>
          </div> */}
        </Link>

        <div className="flex mt-3 md:mt-3.5">
          {[1, 2, 3].map((_, index) => (
            <StarFilledIcon key={index} />
          ))}
          {[1, 2].map((_, index) => (
            <StarOutlinedIcon key={index} />
          ))}
        </div>

        <div className="absolute bottom-3 right-4 flex gap-3">
          <div className="flex items-center gap-0.5">
            <Heart />
            <small className="text-[.6rem] font-bold">
              {formatNumber(likes) || "0"}
            </small>
          </div>
          <ButtonWithTooltipIcon
            IconName={ShareAltOutlined}
            onClick={() => {
              const shareUrlString = "";
              const shareData = {
                title,
                text: "",
                url: shareUrlString,
              };
              shareThis({ shareUrlString, shareData });
            }}
            tip={`share ${title.toLowerCase()}`}
          />
        </div>
      </div>
    </div>
  );
}
export default ListedProducts;
