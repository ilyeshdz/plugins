const {
    ui: { Header, Text, TextTags, HeaderTags }
} = shelter

export function ThemesPage() {
    return (
        <div>
            <Header tag={HeaderTags.H2}>Themes</Header>
            <Text tag={TextTags.textSM}>Here's where you can browse through themes</Text>
        </div>
    );
}
