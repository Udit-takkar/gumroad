import cx from "classnames";
import * as React from "react";
import { cast, createCast } from "ts-safe-cast";

// import { PLACEHOLDER_CARD_PRODUCT, PLACEHOLDER_CART_ITEM } from "$app/utils/cart";
// import { asyncVoid } from "$app/utils/promise";
import { createSocialProof } from "$app/data/social_proof";
import { Thumbnail } from "$app/data/thumbnails";
import { assertResponseError } from "$app/utils/request";
import { register } from "$app/utils/serverComponentUtil";

// import { useBundleEditContext } from "$app/components/BundleEdit/state";
import { Button } from "$app/components/Button";
import { SocialProofCard } from "$app/components/Checkout/SocialProofCard";
import { useSocialProofCardPropsFromPreview } from "$app/components/Checkout/useSocialProofProps";
import { Layout, Page } from "$app/components/CheckoutDashboard/Layout";
import { Icon } from "$app/components/Icons";
import { useLoggedInUser } from "$app/components/LoggedInUser";
// import { coverUrlForThumbnail } from "$app/components/ProductEdit/ProductTab/ThumbnailEditor";
import { ThumbnailEditor } from "$app/components/ProductEdit/ProductTab/ThumbnailEditor";
import { Select } from "$app/components/Select";
import { showAlert } from "$app/components/server-components/Alert";
import { Sort, useSortingTableDriver } from "$app/components/useSortingTableDriver";
import { WithTooltip } from "$app/components/WithTooltip";
// const nativeTypeThumbnails = require.context("$assets/images/native_types/thumbnails/");

export type SortKey = "name" | "clicks" | "conversion" | "revenue" | "status";

// TODO: make this type more specific if possible
// make this union discriminative
type CtaType = { id: "button" | "link" | "none"; label: "Button" | "Link" | "None" };
type ImageType = {
  id: "product" | "custom" | "icon" | "none";
  label: "Product image" | "Custom image" | "Icon" | "None";
};
type VisibilityType = {
  id: "all" | "new" | "returning";
  label: "All visitors" | "New visitors" | "Returning visitors";
};

type Widget = {
  id: string;
  name: string;
  clicks: number;
  conversion: string;
  revenue: string;
  status: "Active" | "Paused";
};

const SocialProofPage = ({ pages = [], products }: { pages?: Page[]; products: Product[] }) => {
  const loggedInUser = useLoggedInUser();
  const [view, setView] = React.useState<"list" | "create" | "edit">("list");

  // Add dummy data for the table
  const dummyWidgets: Widget[] = [
    {
      id: "1",
      name: "Recent purchases",
      clicks: 1245,
      conversion: "12.5%",
      revenue: "$1,245.00",
      status: "Active",
    },
    {
      id: "2",
      name: "Popular items",
      clicks: 876,
      conversion: "8.2%",
      revenue: "$876.00",
      status: "Active",
    },
    {
      id: "3",
      name: "Community favorites",
      clicks: 532,
      conversion: "5.8%",
      revenue: "$532.00",
      status: "Paused",
    },
    {
      id: "4",
      name: "Trending now",
      clicks: 2103,
      conversion: "15.3%",
      revenue: "$2,103.00",
      status: "Active",
    },
  ];

  const [name, setName] = React.useState("");
  const [titleText, setTitleText] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [ctaText, setCtaText] = React.useState("");
  const [iconColor, setIconColor] = React.useState("#FFB800");
  const [universal, setUniversal] = React.useState(false);

  const [ctaType, setCtaType] = React.useState<CtaType>({
    id: "button",
    label: "Button",
  });
  const [image, setImage] = React.useState<ImageType>({ id: "product", label: "Product image" });
  const [thumbnail, setThumbnail] = React.useState<Thumbnail | null>(null);
  const [icon, setIcon] = React.useState<IconName>("heart-fill");
  const [visibility, setVisibility] = React.useState<VisibilityType>({ id: "all", label: "All visitors" });
  // const cartItem = PLACEHOLDER_CART_ITEM;
  // const cardProduct = PLACEHOLDER_CARD_PRODUCT;
  const tableRef = React.useRef<HTMLTableElement>(null);
  const isLoading = false;
  const [sort, setSort] = React.useState<Sort<SortKey> | null>(null);
  const thProps = useSortingTableDriver<SortKey>(sort, setSort);
  const [isSaving, setIsSaving] = React.useState(false);
  const [selectedProductIds, setSelectedProductIds] = React.useState<{ value: string[]; error?: boolean }>({
    value: [],
  });

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const payload = {
        name,
        titleText,
        description,
        ctaText,
        ctaType,
        image,
        icon,
        iconColor,
        selectedProductIds: universal ? [] : selectedProductIds.value,
        universal,
      };
      await createSocialProof(payload);
      showAlert("Changes saved!", "success");
    } catch (e) {
      assertResponseError(e);
      showAlert(e.message, "error");
    }
    setIsSaving(false);
  };

  return view === "list" ? (
    <Layout
      currentPage="form"
      pages={pages}
      actions={
        <Button
          color="accent"
          onClick={() => setView("create")}
          disabled={!loggedInUser?.policies.checkout_form.update}
        >
          New social proof
        </Button>
      }
      hasAside
    >
      <section className="paragraphs">
        <table aria-live="polite" aria-busy={isLoading} ref={tableRef}>
          <caption>Social Proof Widgets</caption>
          <thead>
            <tr>
              <th />
              <th {...thProps("name")} title="Sort by Name">
                Name
              </th>
              <th {...thProps("clicks")} title="Sort by Clicks">
                Clicks
              </th>
              <th {...thProps("conversion")} title="Sort by Conversion">
                Conversion
              </th>
              <th {...thProps("revenue")} title="Sort by Revenue">
                Revenue
              </th>
              <th {...thProps("status")} title="Sort by Status">
                Status
              </th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {dummyWidgets.map((widget) => (
              <tr key={widget.id}>
                <td className="icon-cell">
                  <Icon name="circle-fill" />
                </td>
                <td>
                  <div>
                    <h4>{widget.name}</h4>
                  </div>
                </td>
                <td data-label="Name">{widget.name}</td>
                <td data-label="Clicks" style={{ whiteSpace: "nowrap" }}>
                  {widget.clicks.toLocaleString()}
                </td>
                <td data-label="Conversion" style={{ whiteSpace: "nowrap" }}>
                  {widget.conversion}
                </td>
                <td data-label="Revenue" style={{ whiteSpace: "nowrap" }}>
                  {widget.revenue}
                </td>
                <td data-label="Status" style={{ whiteSpace: "nowrap" }}>
                  {widget.status === "Active" ? (
                    <>
                      <Icon name="circle-fill" /> Active
                    </>
                  ) : (
                    <>
                      <Icon name="circle" /> Paused
                    </>
                  )}
                </td>
                <td data-label="Actions">
                  <Button onClick={() => setView("edit")} disabled={!loggedInUser?.policies.checkout_form.update}>
                    <Icon name="pencil" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>

          <tfoot>
            <tr>
              <td colSpan={2}>Totals</td>
              <td data-label="Total Clicks">
                {dummyWidgets.reduce((sum, widget) => sum + widget.clicks, 0).toLocaleString()}
              </td>
              <td data-label="Average Conversion">
                {(
                  (dummyWidgets.reduce((sum, widget) => sum + parseFloat(widget.conversion), 0) / dummyWidgets.length) *
                  100
                ).toFixed(1)}
                %
              </td>
              <td data-label="Total Revenue">
                $
                {dummyWidgets
                  .reduce((sum, widget) => sum + parseFloat(widget.revenue.replace("$", "").replace(",", "")), 0)
                  .toLocaleString()}
              </td>
              <td colSpan={2}></td>
            </tr>
          </tfoot>
        </table>
      </section>
    </Layout>
  ) : view === "edit" ? (
    <Layout
      currentPage="form"
      pages={pages}
      actions={
        <>
          <Button onClick={() => setView("list")}>
            <Icon name="x-square" />
            Cancel
          </Button>
          <Button type="submit" color="black" onClick={() => void handleSave()} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </>
      }
    >
      <section className="paragraphs">
        <h2 className="mb-4 text-lg font-medium">Edit social proof</h2>
        <p className="text-gray-500 text-sm">Update your social proof settings.</p>

        <form className="mt-6 space-y-4">
          <fieldset>
            <legend>
              <label htmlFor="title">Title</label>
            </legend>
            <input type="text" id="title" placeholder="Recent purchases" defaultValue="Recent purchases" />
          </fieldset>

          <fieldset>
            <legend>
              <label htmlFor="display">Display settings</label>
            </legend>
            <select id="display">
              <option value="top">Top of page</option>
              <option value="bottom">Bottom of page</option>
              <option value="corner">Corner popup</option>
            </select>
          </fieldset>

          <fieldset>
            <legend>Configuration</legend>
            <label>
              <input type="checkbox" defaultChecked />
              Show customer name
            </label>
            <label>
              <input type="checkbox" defaultChecked />
              Show product name
            </label>
            <label>
              <input type="checkbox" defaultChecked />
              Show timestamp
            </label>
          </fieldset>
        </form>
      </section>
    </Layout>
  ) : (
    <Form
      title="Create widget"
      products={products}
      name={name}
      titleText={titleText}
      description={description}
      ctaText={ctaText}
      ctaType={ctaType}
      image={image}
      thumbnail={thumbnail}
      icon={icon}
      iconColor={iconColor}
      universal={universal}
      selectedProductIds={selectedProductIds}
      visibility={visibility}
      setThumbnail={setThumbnail}
      setName={setName}
      setTitleText={setTitleText}
      setDescription={setDescription}
      setCtaText={setCtaText}
      setCtaType={setCtaType}
      setImage={setImage}
      setIcon={setIcon}
      setIconColor={setIconColor}
      setUniversal={setUniversal}
      setSelectedProductIds={setSelectedProductIds}
      setVisibility={setVisibility}
      setView={setView}
      save={handleSave}
    />
  );
};

export default register({ component: SocialProofPage, propParser: createCast() });

type Product = {
  id: string;
  name: string;
  url: string;
  is_tiered_membership: boolean;
  archived: boolean;
};

const Form = ({
  name,
  title,
  products,
  titleText,
  description,
  ctaText,
  ctaType,
  image,
  icon,
  thumbnail,
  iconColor,
  universal,
  selectedProductIds,
  visibility,
  setName,
  setTitleText,
  setDescription,
  setCtaText,
  setCtaType,
  setImage,
  setIcon,
  setThumbnail,
  setIconColor,
  setUniversal,
  setSelectedProductIds,
  setVisibility,
  setView,
  save,
}: {
  title: string;
  products: Product[];
  name: string;
  titleText: string;
  description: string;
  ctaText: string;
  ctaType: CtaType;
  image: ImageType;
  thumbnail: Thumbnail | null;
  visibility: VisibilityType;
  icon: IconName;
  iconColor: string;
  universal: boolean;
  selectedProductIds: { value: string[]; error?: boolean };
  setThumbnail: React.Dispatch<React.SetStateAction<Thumbnail | null>>;
  setName: React.Dispatch<React.SetStateAction<string>>;
  setTitleText: React.Dispatch<React.SetStateAction<string>>;
  setDescription: React.Dispatch<React.SetStateAction<string>>;
  setCtaText: React.Dispatch<React.SetStateAction<string>>;
  setCtaType: React.Dispatch<React.SetStateAction<CtaType>>;
  setImage: React.Dispatch<React.SetStateAction<ImageType>>;
  setIcon: React.Dispatch<React.SetStateAction<IconName>>;
  setIconColor: React.Dispatch<React.SetStateAction<string>>;
  setVisibility: React.Dispatch<React.SetStateAction<VisibilityType>>;
  setView: React.Dispatch<React.SetStateAction<"list" | "create" | "edit">>;
  setUniversal: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedProductIds: React.Dispatch<React.SetStateAction<{ value: string[]; error?: boolean }>>;
  save: () => Promise<void>;
}) => {
  const selectedProducts = products.filter(({ id }) => selectedProductIds.value.includes(id));

  const uid = React.useId();

  return (
    <div className="fixed-aside" style={{ display: "contents" }}>
      <header className="sticky-top">
        <h1>{title}</h1>
        <div className="actions">
          <Button
            onClick={() => {
              setView("list");
            }}
          >
            <Icon name="x-square" />
            Cancel
          </Button>
          <Button type="submit" color="black" onClick={() => void save()} disabled={false}>
            Add
          </Button>
          <Button color="accent">Publish</Button>
        </div>
      </header>
      <main className="squished">
        <form>
          <section className="paragraphs">
            <fieldset className={cx({ danger: false })}>
              <legend>
                <label htmlFor="name">Widget name</label>
              </legend>
              <input
                type="text"
                id="name"
                placeholder="Community members"
                value={name}
                onChange={(evt) => setName(evt.target.value)}
                aria-invalid={false}
              />
            </fieldset>
            <fieldset className={cx({ danger: selectedProductIds.error })}>
              <legend>
                <label htmlFor={`${uid}products`}>Products</label>
              </legend>
              <Select
                inputId={`${uid}products`}
                instanceId={`${uid}products`}
                options={products
                  .filter((product) => !product.archived)
                  .map((product) => ({ id: product.id, label: product.name }))}
                value={selectedProducts.map(({ id, name: label }) => ({
                  id,
                  label,
                }))}
                isMulti
                isClearable
                placeholder="Products to which this discount will apply"
                onChange={(selectedIds) => {
                  setSelectedProductIds({ value: selectedIds.map(({ id }) => id) });
                }}
                isDisabled={universal}
                aria-invalid={selectedProductIds.error}
              />
              <label>
                <input
                  type="checkbox"
                  checked={universal}
                  onChange={(evt) => {
                    setUniversal(evt.target.checked);
                    setSelectedProductIds({ value: [] });
                  }}
                  aria-invalid={selectedProductIds.error}
                />
                All products
              </label>
            </fieldset>
          </section>
          <section className="paragraphs">
            <h2>Message</h2>
            <p>
              Click on the buttons below to quickly add them to your title, description, or call to action. This will
              dynamically update your widget.{" "}
              <a
                // TODO: find the correct link
                href="#"
                target="_blank"
                rel="noreferrer"
              >
                Learn more
              </a>
            </p>
            <fieldset className={cx({ danger: false })}>
              <legend>
                <label htmlFor="title">Title</label>
              </legend>
              <input
                type="text"
                id="title"
                placeholder="TODO: add placeholder"
                value={titleText}
                onChange={(evt) => setTitleText(evt.target.value)}
                aria-invalid={false}
              />
            </fieldset>
            <fieldset className={cx({ danger: false })}>
              <legend>
                <label htmlFor="description">Description</label>
              </legend>
              <textarea
                id="description"
                placeholder="TODO: add placeholder"
                value={description}
                onChange={(evt) => setDescription(evt.target.value)}
                aria-invalid={false}
              />
            </fieldset>
            <fieldset className={cx({ danger: false })}>
              <legend>
                <label htmlFor="cta">Call to action</label>
              </legend>
              <input
                type="text"
                id="cta"
                placeholder="TODO: Purchase Now"
                value={ctaText}
                onChange={(evt) => setCtaText(evt.target.value)}
                aria-invalid={false}
              />
            </fieldset>
            <fieldset className={cx({ danger: false })}>
              <legend>
                <label htmlFor="cta-type">Call to action</label>
              </legend>
              <Select
                inputId="cta-type"
                instanceId="cta-type"
                options={[
                  { id: "button", label: "Button" },
                  { id: "link", label: "Link" },
                  { id: "none", label: "None" },
                ]}
                isMulti={false}
                value={{ id: ctaType.id, label: ctaType.label }}
                onChange={(selected) => {
                  setCtaType(cast(selected));
                }}
              />
            </fieldset>
          </section>
          <section className="paragraphs">
            <h2>Image</h2>
            <fieldset>
              <legend>
                <label htmlFor="image">Image</label>
              </legend>
              <Select
                inputId="image"
                instanceId="image"
                isMulti={false}
                options={[
                  { id: "product", label: "Product image" },
                  { id: "custom", label: "Custom image" },
                  { id: "none", label: "None" },
                  { id: "icon", label: "Icon" },
                ]}
                value={image}
                onChange={(selected) => {
                  setImage(cast(selected));
                }}
              />
              {image.id === "custom" && (
                <ThumbnailEditor
                  covers={[]}
                  thumbnail={thumbnail}
                  setThumbnail={setThumbnail}
                  permalink=""
                  nativeType="bundle"
                />
              )}
              {image.id === "icon" && (
                <>
                  <div>
                    <Button onClick={() => setIcon("heart-fill")}>
                      <Icon name="heart-fill" />
                    </Button>
                  </div>
                  <fieldset>
                    <legend>
                      <label htmlFor={`${uid}-iconColor`}>Icon color</label>
                    </legend>
                    <div className="color-picker">
                      <input
                        id={`${uid}-iconColor`}
                        value={iconColor}
                        type="color"
                        onChange={(evt) => setIconColor(evt.target.value)}
                      />
                    </div>
                  </fieldset>
                </>
              )}
            </fieldset>
          </section>

          <section className="paragraphs">
            <h2>Settings</h2>
            <fieldset>
              <legend>
                <label htmlFor="visibility">Widget will be visible to...</label>
              </legend>
              <Select
                inputId="visibility"
                instanceId="visibility"
                options={[
                  { id: "all", label: "All visitors" },
                  { id: "new", label: "New visitors" },
                  { id: "returning", label: "Returning visitors" },
                ]}
                value={visibility}
                onChange={(selected) => {
                  setVisibility(cast(selected));
                }}
              />
            </fieldset>
          </section>
        </form>
      </main>
      <Preview
        name={name}
        titleText={titleText}
        description={description}
        ctaText={ctaText}
        ctaType={ctaType}
        image={image}
        icon={icon}
        iconColor={iconColor}
      />
    </div>
  );
};

const Preview = ({
  titleText,
  description,
  ctaText,
  ctaType,
  image,
  icon,
  iconColor,
}: {
  name: string;
  titleText: string;
  description: string;
  ctaText: string;
  // TODO: proper types here
  ctaType: CtaType;
  image: ImageType;
  icon: IconName;
  iconColor: string;
}) => {
  const socialProofCardProps = useSocialProofCardPropsFromPreview({
    titleText,
    description,
    ctaText,
    ctaType: ctaType.id,
    image,
    icon,
    iconColor,
  });

  return (
    <aside aria-label="Preview">
      <header>
        <h2>Preview</h2>
        <WithTooltip tip="Preview">
          {/* TODO: add link */}
          <Button onClick={() => {}}>
            <Icon name="arrow-diagonal-up-right" />
          </Button>
        </WithTooltip>
      </header>
      <div className="paragraphs flex aspect-square items-center justify-center rounded border border-black">
        <SocialProofCard {...socialProofCardProps} />
      </div>
    </aside>
  );
};
