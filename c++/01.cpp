
#include <iostream>
#include "solutions.h"
#include "grid.h"

class Day01 : public SolutionInterface<Day01> {
public:
    Day01() {
    }
    ~Day01() {
    }

    std::vector<int> expenses;

    std::vector<std::string> output;

    virtual void run() {
        expenses = get_input_int_array();

        for (std::vector<int>::iterator it = expenses.begin() ; it != expenses.end(); ++it) {
            auto format = "%d + ?? = 2020";
            auto size = std::snprintf(nullptr, 0, format, *it);
            std::string formatted_string(size + 1, '\0');
            std::sprintf(&formatted_string[0], format, *it);

            output.insert(output.end(), formatted_string);
        }
    }

    virtual void draw() {
        ImGui::Begin(solution_name.c_str());
        
        static const ImVec4 col_normal = ImVec4(1.0f, 1.0f, 1.0f, 1.0f);
        static const ImVec4 col_error = ImVec4(1.0f, .0f, .0f, 1.0f);
        static const ImVec4 col_success = ImVec4(.0f, 1.0f, .0f, 1.0f);

        for (std::vector<std::string>::iterator it = output.begin() ; it != output.end(); ++it) {
            ImGui::TextColored(col_normal, it->c_str());
        }

        ImGui::End();
    }
};
