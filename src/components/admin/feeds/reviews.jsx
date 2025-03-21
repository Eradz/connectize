import { Avatar } from "@chakra-ui/react";
import React from "react";
import MoreOptions from "../../MoreOptions";
import LightParagraph from "../../ParagraphText";
import ProfileSection from "../../userProfile/profile-section";

export default function Reviews({ reviews = [] }) {
  return (
    <ProfileSection>
      <h1 className="p-2 text-xl md:text-lg font-bold">Reviews</h1>
      <section className="space-y-4 divide-y">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <Review
              key={review.id}
              image={review.user.avatar}
              name={review.user.first_name + " " + review.user.last_name}
              date={review.reviewed_at}
              text={review.review}
            />
          ))
        ) : (
          <LightParagraph>No reviews yet</LightParagraph>
        )}
      </section>
    </ProfileSection>
  );
}

const Review = ({ image, name, date, text }) => {
  return (
    <div className="flex items-center gap-2 first:!pt-0 pt-4">
      <Avatar src={image} name={name} size="md" />

      <div className="w-full">
        <div className="flex justify-between">
          <h4 className="capitalize font-bold text-lg md:text-base">{name}</h4>
          <MoreOptions>
            <div>more options</div>
          </MoreOptions>
        </div>
        <div>
          <small className="text-custom_grey text-xs">{date}</small>
          <LightParagraph>{text}</LightParagraph>
        </div>
      </div>
    </div>
  );
};
