#pragma once

#include <imgui.h>
#include <vector>
#include <mutex>

struct GridObject {
    int x = 0;
    int y = 0;
    char val = ' ';
    ImVec4 colour;
};

class Grid {
public:
    Grid() : cell_w(64), cell_h(64) {};
    Grid(int cell_size) : cell_w(cell_size), cell_h(cell_size) {};
    Grid(int cell_w, int cell_h) : cell_w(cell_w), cell_h(cell_h) {};

    virtual ImVec4 get_char_colour(char c) { return ImVec4(); };

    const int cell_w;
    const int cell_h;

    // TODO - better spatial strcuture?
    std::vector<GridObject*> objects;

    std::mutex mtx;

    GridObject* add_object(char val, int x = 0, int y = 0) {
        mtx.lock();
        GridObject* new_object = new GridObject();
        new_object->x = x;
        new_object->y = y;
        new_object->val = val;
        objects.insert(objects.end(), new_object);
        mtx.unlock();
        return new_object;
    }

    void draw() {
        static ImVector<ImVec2> points;
        static ImVec2 scrolling(0.0f, 0.0f);
        static bool opt_enable_grid = true;
        static bool opt_enable_context_menu = true;
        static bool adding_line = false;
        
        // Using InvisibleButton() as a convenience 1) it will advance the layout cursor and 2) allows us to use IsItemHovered()/IsItemActive()
        ImVec2 canvas_p0 = ImGui::GetCursorScreenPos();      // ImDrawList API uses screen coordinates!
        ImVec2 canvas_sz = ImGui::GetContentRegionAvail();   // Resize canvas to what's available
        if (canvas_sz.x < 50.0f) canvas_sz.x = 50.0f;
        if (canvas_sz.y < 50.0f) canvas_sz.y = 50.0f;
        ImVec2 canvas_p1 = ImVec2(canvas_p0.x + canvas_sz.x, canvas_p0.y + canvas_sz.y);

        // Draw border and background color
        ImGuiIO& io = ImGui::GetIO();
        ImDrawList* draw_list = ImGui::GetWindowDrawList();
        draw_list->AddRectFilled(canvas_p0, canvas_p1, IM_COL32(50, 50, 50, 255));
        draw_list->AddRect(canvas_p0, canvas_p1, IM_COL32(255, 255, 255, 255));

        // This will catch our interactions
        ImGui::InvisibleButton("canvas", canvas_sz, ImGuiButtonFlags_MouseButtonLeft | ImGuiButtonFlags_MouseButtonRight);
        const bool is_hovered = ImGui::IsItemHovered(); // Hovered
        const bool is_active = ImGui::IsItemActive();   // Held
        const ImVec2 origin(canvas_p0.x + scrolling.x, canvas_p0.y + scrolling.y); // Lock scrolled origin
        const ImVec2 mouse_pos_in_canvas(io.MousePos.x - origin.x, io.MousePos.y - origin.y);

        // Add first and second point
        if (is_hovered && !adding_line && ImGui::IsMouseClicked(ImGuiMouseButton_Left))
        {
            points.push_back(mouse_pos_in_canvas);
            points.push_back(mouse_pos_in_canvas);
            adding_line = true;
        }
        if (adding_line)
        {
            points.back() = mouse_pos_in_canvas;
            if (!ImGui::IsMouseDown(ImGuiMouseButton_Left))
                adding_line = false;
        }

        // Pan (we use a zero mouse threshold when there's no context menu)
        // You may decide to make that threshold dynamic based on whether the mouse is hovering something etc.
        const float mouse_threshold_for_pan = opt_enable_context_menu ? -1.0f : 0.0f;
        if (is_active && ImGui::IsMouseDragging(ImGuiMouseButton_Right, mouse_threshold_for_pan))
        {
            scrolling.x += io.MouseDelta.x;
            scrolling.y += io.MouseDelta.y;
        }

        // Context menu (under default mouse threshold)
        ImVec2 drag_delta = ImGui::GetMouseDragDelta(ImGuiMouseButton_Right);
        if (opt_enable_context_menu && ImGui::IsMouseReleased(ImGuiMouseButton_Right) && drag_delta.x == 0.0f && drag_delta.y == 0.0f)
            ImGui::OpenPopupOnItemClick("context");
        if (ImGui::BeginPopup("context"))
        {
            if (adding_line)
                points.resize(points.size() - 2);
            adding_line = false;
            if (ImGui::MenuItem("Remove one", NULL, false, points.Size > 0)) { points.resize(points.size() - 2); }
            if (ImGui::MenuItem("Remove all", NULL, false, points.Size > 0)) { points.clear(); }
            ImGui::EndPopup();
        }

        // Draw grid + all lines in the canvas
        draw_list->PushClipRect(canvas_p0, canvas_p1, true);
        if (opt_enable_grid)
        {
            for (float x = fmodf(scrolling.x, cell_w); x < canvas_sz.x; x += cell_w)
                draw_list->AddLine(ImVec2(canvas_p0.x + x, canvas_p0.y), ImVec2(canvas_p0.x + x, canvas_p1.y), IM_COL32(200, 200, 200, 40));
            for (float y = fmodf(scrolling.y, cell_h); y < canvas_sz.y; y += cell_h)
                draw_list->AddLine(ImVec2(canvas_p0.x, canvas_p0.y + y), ImVec2(canvas_p1.x, canvas_p0.y + y), IM_COL32(200, 200, 200, 40));
        }
        for (int n = 0; n < points.Size; n += 2)
            draw_list->AddLine(ImVec2(origin.x + points[n].x, origin.y + points[n].y), ImVec2(origin.x + points[n + 1].x, origin.y + points[n + 1].y), IM_COL32(255, 255, 0, 255), 2.0f);

        // test shape
        draw_list->AddQuadFilled(origin, ImVec2(origin.x, origin.y + cell_h), ImVec2(origin.x + cell_w, origin.y), ImVec2(origin.x + cell_w, origin.y + cell_h), IM_COL32(255, 0, 0, 255));

        for (std::vector<GridObject*>::iterator it = objects.begin() ; it != objects.end(); ++it) {
            GridObject* obj = (*it);
            const ImVec2 objectPos = ImVec2(origin.x + (obj->x * cell_w), origin.y + (obj->y * cell_h));
            draw_list->AddQuadFilled(objectPos, ImVec2(objectPos.x, objectPos.y + cell_h), ImVec2(objectPos.x + cell_w, objectPos.y + cell_h), ImVec2(objectPos.x + cell_w, objectPos.y), IM_COL32(obj->colour.x, obj->colour.y, obj->colour.z, 1.0f));
        }

        draw_list->PopClipRect();
    }
};
