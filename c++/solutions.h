#pragma once

#include "imgui.h"

#include <string>
#include <vector>
#include <map>
#include <functional>
#include <iostream>
#include <algorithm>
#include <fstream>
#include <thread>

class Solution {
public:
    struct SolutionEntry {
        public:
        Solution* instance = nullptr;
        std::string name;
        bool active = false;
        std::thread* run_thread = nullptr;

        SolutionEntry(Solution* instance, std::string name) : instance(instance), name(name) {};
        ~SolutionEntry() {
            stop();
        }

        void start() {
            if (!instance->bRunning) {
                // run in a separate thread so we're not held up by the UI
                instance->bRunning = true;
                run_thread = new std::thread(&Solution::run, instance);
            }
        }

        void stop() {
            if (run_thread != nullptr) {
                instance->bRunning = false;
                if(run_thread->joinable()) {
                    run_thread->join();
                }
                delete run_thread;
            }
        }
    };

    std::string solution_name;
    bool bRunning = false;

    static std::vector<SolutionEntry>& get_registry() {
        static std::vector<SolutionEntry> registry;
        return registry;
    }

    static Solution* get_solution(std::string name) {
        static std::vector<SolutionEntry> registry = get_registry();
        for (std::vector<SolutionEntry>::iterator it = registry.begin() ; it != registry.end(); ++it) {
            if (it->name.compare(name) == 0) {
                return it->instance;
            }
        }
        return nullptr;
    }

    static void shutdown() {
        static std::vector<SolutionEntry> registry = get_registry();
        for (std::vector<SolutionEntry>::iterator it = registry.begin() ; it != registry.end(); ++it) {
            it->stop();
        }
    }

    /**
     * Draw our ImGUI solution browser
     */
    static void draw_window() {
        static std::vector<SolutionEntry> registry = get_registry();
        
        {
            ImGui::Begin("Solution Browser");
            ImGui::Text("Application average %.3f ms/frame (%.1f FPS)", 1000.0f / ImGui::GetIO().Framerate, ImGui::GetIO().Framerate);

            int idx = 0;
            ImGui::PushID("solution_buttons");
            for (std::vector<SolutionEntry>::iterator it = registry.begin() ; it != registry.end(); ++it) {
                ImGui::Text(it->name.c_str());
                ImGui::SameLine();
                ImGui::PushID(idx++);
                if (ImGui::Button("Run")) {
                    std::cout << it->name << std::endl;
                    it->active = !it->active;
                    
                    // start our solution when opening
                    if (it->active) {
                        it->start();
                    } else {
                        it->stop();
                    }
                }
                ImGui::PopID();
            }
            ImGui::PopID();
            ImGui::End();
        }

        for (std::vector<SolutionEntry>::iterator it = registry.begin() ; it != registry.end(); ++it) {
            if (it->active) {
                it->instance->draw();
            }
        }
    }

    std::string get_input() {
        std::ifstream myfile;
        std::string output = "";
        myfile.open("C:\\Users\\cubeh\\code\\AdventOfCode2020\\inputs\\01.txt");
        if (myfile.is_open())
        {
            std::string line;
            while ( std::getline (myfile,line) )
            {
                output += line + '\n';
            }
            myfile.close();
        } else {
            std::cout << "Failed to open input" << std::endl;
        }
        return output;
    }

    std::vector<std::string> get_input_array() {
        std::string input_raw = get_input();
        
        size_t pos = 0;
        std::vector<std::string> output;
        std::string token;
        static const std::string delimiter = "\n";
        while ((pos = input_raw.find(delimiter)) != std::string::npos) {
            token = input_raw.substr(0, pos);
            output.insert(output.end(), token);
            input_raw.erase(0, pos + delimiter.length());
        }
        return output;
    }

    std::vector<int> get_input_int_array() {
        std::string input_raw = get_input();
        
        size_t pos = 0;
        std::vector<int> output;
        std::string token;
        static const std::string delimiter = "\n";
        while ((pos = input_raw.find(delimiter)) != std::string::npos) {
            token = input_raw.substr(0, pos);
            output.insert(output.end(), std::stoi(token));
            input_raw.erase(0, pos + delimiter.length());
        }
        return output;
    }

    virtual void run() {};
    virtual void draw() {};
};

template<class T>
struct SolutionInterface : public Solution {
public:
    virtual ~SolutionInterface() { if(!registered_) std::cout << "" << std::endl; }

    static inline bool register_type() {
        // don't register any abstract classes
        if (std::is_abstract<T>::value) {
            return false;
        }

        // find the name of this class so we can print it in our UI
        std::string className = typeid(T).name();
        std::size_t found = className.find("class ");
        if (found >= 0) {
            className.erase(found, 6);
        }

        std::cout << "Registering class " << className  << std::endl;

        SolutionEntry newentry(create_instance(), className);
        newentry.instance->solution_name = className;

        auto& registry = get_registry();
        registry.insert(registry.end(), newentry);

        return true;
    }

    static Solution* create_instance() {
        return new T();
    }

    static const bool registered_;
};
template<class T>
const bool SolutionInterface<T>::registered_ = SolutionInterface<T>::register_type();
